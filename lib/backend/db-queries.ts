import { supabaseAdmin } from "./supabase-admin";
import { UserProfile, Group, Tag, Task, TaskFilterOptions, TaskStatus, TimeTracking } from "@/types";
import { MOCK_GROUPS, MOCK_TASKS } from "@/lib/mock-data";

/**
 * In-memory fallback store for development when Supabase DB is not connected
 */
let inMemoryGroups: (Group & { tags: Tag[] })[] = [...MOCK_GROUPS];
let inMemoryTasks: Task[] = [...MOCK_TASKS];
let inMemoryTrackings: Array<{ id: string; taskId: string; startAt: string; endAt: string | null; durationSeconds: number }> = [];

export async function fetchGroupsWithTags(): Promise<(Group & { tags: Tag[] })[]> {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder")) {
      return inMemoryGroups;
    }

    const { data: groups, error: groupError } = await supabaseAdmin
      .from("groups")
      .select("*, tags(*)")
      .order("created_at", { ascending: true });

    if (groupError || !groups) return inMemoryGroups;

    return groups.map((g) => ({
      id: g.id,
      name: g.name,
      color: g.color || "#6366f1",
      createdAt: g.created_at,
      tags: (g.tags || []).map((t: Record<string, unknown>) => ({
        id: t.id as string,
        name: t.name as string,
        groupId: t.group_id as string,
        createdAt: t.created_at as string,
      })),
    }));
  } catch (err) {
    return inMemoryGroups;
  }
}

export async function insertGroup(name: string, color: string = "#6366f1"): Promise<Group & { tags: Tag[] }> {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder")) {
      const newGroup: Group & { tags: Tag[] } = {
        id: `group-${Date.now()}`,
        name,
        color,
        createdAt: new Date().toISOString(),
        tags: [],
      };
      inMemoryGroups.push(newGroup);
      return newGroup;
    }

    const { data, error } = await supabaseAdmin
      .from("groups")
      .insert([{ name, color }])
      .select("*")
      .single();

    if (error || !data) throw new Error(error?.message || "Failed to insert group");

    return {
      id: data.id,
      name: data.name,
      color: data.color,
      createdAt: data.created_at,
      tags: [],
    };
  } catch (err) {
    const newGroup: Group & { tags: Tag[] } = {
      id: `group-${Date.now()}`,
      name,
      color,
      createdAt: new Date().toISOString(),
      tags: [],
    };
    inMemoryGroups.push(newGroup);
    return newGroup;
  }
}

export async function insertTag(name: string, groupId: string): Promise<Tag> {
  if (!groupId) throw new Error("group_id là bắt buộc để tạo Tag");

  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder")) {
      const newTag: Tag = {
        id: `tag-${Date.now()}`,
        name,
        groupId,
        createdAt: new Date().toISOString(),
      };
      const parent = inMemoryGroups.find((g) => g.id === groupId);
      if (parent) parent.tags.push(newTag);
      return newTag;
    }

    const { data, error } = await supabaseAdmin
      .from("tags")
      .insert([{ name, group_id: groupId }])
      .select("*")
      .single();

    if (error || !data) throw new Error(error?.message || "Failed to insert tag");

    return {
      id: data.id,
      name: data.name,
      groupId: data.group_id,
      createdAt: data.created_at,
    };
  } catch (err) {
    const newTag: Tag = {
      id: `tag-${Date.now()}`,
      name,
      groupId,
      createdAt: new Date().toISOString(),
    };
    const parent = inMemoryGroups.find((g) => g.id === groupId);
    if (parent) parent.tags.push(newTag);
    return newTag;
  }
}

export async function removeGroup(id: string): Promise<boolean> {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder")) {
      inMemoryGroups = inMemoryGroups.filter((g) => g.id !== id);
      inMemoryTasks = inMemoryTasks.filter((t) => t.groupId !== id);
      return true;
    }

    await supabaseAdmin.from("groups").delete().eq("id", id);
    return true;
  } catch (err) {
    inMemoryGroups = inMemoryGroups.filter((g) => g.id !== id);
    return true;
  }
}

export async function removeTag(id: string): Promise<boolean> {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder")) {
      inMemoryGroups.forEach((g) => {
        g.tags = g.tags.filter((t) => t.id !== id);
      });
      return true;
    }

    await supabaseAdmin.from("tags").delete().eq("id", id);
    return true;
  } catch (err) {
    inMemoryGroups.forEach((g) => {
      g.tags = g.tags.filter((t) => t.id !== id);
    });
    return true;
  }
}

export async function fetchFilteredTasks(options: TaskFilterOptions): Promise<Task[]> {
  const { groupId, tagId, status, search, startDate, endDate } = options;

  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder")) {
      return inMemoryTasks.filter((task) => {
        if (groupId && task.groupId !== groupId) return false;
        if (tagId && !task.tags?.some((t) => t.id === tagId)) return false;
        if (status && status !== "all" && task.status !== status) return false;
        if (search && search.trim()) {
          const q = search.toLowerCase();
          const matchTitle = task.title.toLowerCase().includes(q);
          const matchTag = task.tags?.some((t) => t.name.toLowerCase().includes(q));
          if (!matchTitle && !matchTag) return false;
        }
        if (startDate && new Date(task.createdAt) < new Date(startDate)) return false;
        if (endDate && new Date(task.createdAt) > new Date(endDate)) return false;
        return true;
      });
    }

    let query = supabaseAdmin
      .from("tasks")
      .select(`
        *,
        groups(*),
        task_tags(tag_id, tags(*)),
        time_trackings(duration_seconds)
      `)
      .order("created_at", { ascending: false });

    if (groupId) query = query.eq("group_id", groupId);
    if (status && status !== "all") query = query.eq("status", status);
    if (search && search.trim()) query = query.ilike("title", `%${search.trim()}%`);
    if (startDate) query = query.gte("created_at", startDate);
    if (endDate) query = query.lte("created_at", endDate);

    const { data, error } = await query;

    if (error || !data) return inMemoryTasks;

    let results: Task[] = data.map((t: Record<string, unknown>) => {
      const taskTagsData = t.task_tags as Array<{ tag_id: string; tags: Record<string, unknown> }>;
      const tagsList: Tag[] = (taskTagsData || [])
        .map((tt) => tt.tags)
        .filter(Boolean)
        .map((tg) => ({
          id: tg.id as string,
          name: tg.name as string,
          groupId: tg.group_id as string,
        }));

      const trackings = t.time_trackings as Array<{ duration_seconds: number }>;
      const totalSecs = (trackings || []).reduce((acc, curr) => acc + (curr.duration_seconds || 0), 0);

      return {
        id: t.id as string,
        title: t.title as string,
        status: t.status as Task["status"],
        groupId: t.group_id as string | null,
        dueDate: t.due_date as string | null,
        notionContent: t.notion_content as Record<string, unknown>,
        isKnowledgeNote: Boolean(t.is_knowledge_note),
        createdAt: t.created_at as string,
        group: t.groups ? (t.groups as Group) : undefined,
        tags: tagsList,
        totalDurationSeconds: totalSecs,
      };
    });

    if (tagId) {
      results = results.filter((task) => task.tags?.some((tg) => tg.id === tagId));
    }

    return results;
  } catch (err) {
    return inMemoryTasks;
  }
}

export async function insertTask(taskPayload: {
  title: string;
  groupId?: string | null;
  tagIds?: string[];
  status?: Task["status"];
  dueDate?: string | null;
  isKnowledgeNote?: boolean;
}): Promise<Task> {
  const { title, groupId, tagIds = [], status = "todo", dueDate, isKnowledgeNote = false } = taskPayload;

  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder")) {
      const allGroups = await fetchGroupsWithTags();
      const parentGroup = allGroups.find((g) => g.id === groupId);
      const associatedTags: Tag[] = [];

      allGroups.forEach((g) => {
        g.tags.forEach((t) => {
          if (tagIds.includes(t.id)) associatedTags.push(t);
        });
      });

      const newTask: Task = {
        id: `task-${Date.now()}`,
        title,
        status,
        groupId: groupId || null,
        dueDate: dueDate || null,
        isKnowledgeNote,
        createdAt: new Date().toISOString(),
        group: parentGroup,
        tags: associatedTags,
        totalDurationSeconds: 0,
      };

      inMemoryTasks.unshift(newTask);
      return newTask;
    }

    const { data: taskData, error: taskError } = await supabaseAdmin
      .from("tasks")
      .insert([
        {
          title,
          group_id: groupId || null,
          status,
          due_date: dueDate || null,
          is_knowledge_note: isKnowledgeNote,
        },
      ])
      .select("*")
      .single();

    if (taskError || !taskData) throw new Error(taskError?.message || "Failed to create task");

    if (tagIds.length > 0) {
      const junctionData = tagIds.map((tagId) => ({
        task_id: taskData.id,
        tag_id: tagId,
      }));
      await supabaseAdmin.from("task_tags").insert(junctionData);
    }

    return {
      id: taskData.id,
      title: taskData.title,
      status: taskData.status,
      groupId: taskData.group_id,
      dueDate: taskData.due_date,
      isKnowledgeNote: taskData.is_knowledge_note,
      createdAt: taskData.created_at,
      totalDurationSeconds: 0,
    };
  } catch (err) {
    const newTask: Task = {
      id: `task-${Date.now()}`,
      title,
      status,
      groupId: groupId || null,
      dueDate: dueDate || null,
      isKnowledgeNote,
      createdAt: new Date().toISOString(),
      totalDurationSeconds: 0,
    };
    inMemoryTasks.unshift(newTask);
    return newTask;
  }
}

export async function updateTask(
  id: string,
  updates: Partial<{ status: TaskStatus; title: string; due_date: string | null; group_id: string | null; is_knowledge_note: boolean }>
): Promise<boolean> {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder")) {
      const task = inMemoryTasks.find((t) => t.id === id);
      if (task) {
        if (updates.status) task.status = updates.status;
        if (updates.title) task.title = updates.title;
        if (updates.due_date !== undefined) task.dueDate = updates.due_date;
        if (updates.group_id !== undefined) task.groupId = updates.group_id;
        if (updates.is_knowledge_note !== undefined) task.isKnowledgeNote = updates.is_knowledge_note;
      }
      return true;
    }

    const { error } = await supabaseAdmin.from("tasks").update(updates).eq("id", id);
    if (error) {
      const task = inMemoryTasks.find((t) => t.id === id);
      if (task && updates.status) task.status = updates.status;
    }
    return true;
  } catch (err) {
    const task = inMemoryTasks.find((t) => t.id === id);
    if (task && updates.status) task.status = updates.status;
    return true;
  }
}

export async function removeTask(id: string): Promise<boolean> {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder")) {
      inMemoryTasks = inMemoryTasks.filter((t) => t.id !== id);
      return true;
    }

    await supabaseAdmin.from("tasks").delete().eq("id", id);
    return true;
  } catch (err) {
    inMemoryTasks = inMemoryTasks.filter((t) => t.id !== id);
    return true;
  }
}

/**
 * Start Task Timer:
 * 1. Automatically close any currently open session (end_at IS NULL)
 * 2. Create a new session in time_trackings with start_at = now()
 * 3. Update task status to 'in_progress'
 */
export async function startTaskTimer(taskId: string): Promise<{ sessionId: string; taskId: string; startAt: string }> {
  const now = new Date().toISOString();

  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder")) {
      // Close open sessions in memory
      inMemoryTrackings.forEach((session) => {
        if (!session.endAt) {
          session.endAt = now;
          const duration = Math.floor((new Date(now).getTime() - new Date(session.startAt).getTime()) / 1000);
          session.durationSeconds = duration;

          // Update total duration on task
          const t = inMemoryTasks.find((item) => item.id === session.taskId);
          if (t) {
            t.totalDurationSeconds = (t.totalDurationSeconds || 0) + duration;
          }
        }
      });

      // Insert new session
      const newSession = {
        id: `tracking-${Date.now()}`,
        taskId,
        startAt: now,
        endAt: null,
        durationSeconds: 0,
      };
      inMemoryTrackings.push(newSession);

      // Update task status to in_progress
      const task = inMemoryTasks.find((t) => t.id === taskId);
      if (task) {
        task.status = "in_progress";
      }

      return { sessionId: newSession.id, taskId, startAt: now };
    }

    // 1. Close open sessions in Supabase
    const { data: openSessions } = await supabaseAdmin
      .from("time_trackings")
      .select("*")
      .is("end_at", null);

    if (openSessions && openSessions.length > 0) {
      for (const s of openSessions) {
        const start = new Date(s.start_at).getTime();
        const duration = Math.floor((Date.now() - start) / 1000);
        await supabaseAdmin
          .from("time_trackings")
          .update({ end_at: now, duration_seconds: duration })
          .eq("id", s.id);
      }
    }

    // 2. Insert new session
    const { data: newSession, error: sessionErr } = await supabaseAdmin
      .from("time_trackings")
      .insert([{ task_id: taskId, start_at: now }])
      .select("*")
      .single();

    if (sessionErr || !newSession) throw new Error(sessionErr?.message || "Failed to start timer");

    // 3. Update task status to in_progress
    await supabaseAdmin
      .from("tasks")
      .update({ status: "in_progress" })
      .eq("id", taskId);

    return { sessionId: newSession.id, taskId, startAt: now };
  } catch (err) {
    console.warn("[DB Fallback] startTaskTimer in memory due to error:", err);
    const newSession = {
      id: `tracking-${Date.now()}`,
      taskId,
      startAt: now,
      endAt: null,
      durationSeconds: 0,
    };
    inMemoryTrackings.push(newSession);

    const task = inMemoryTasks.find((t) => t.id === taskId);
    if (task) task.status = "in_progress";

    return { sessionId: newSession.id, taskId, startAt: now };
  }
}

/**
 * Stop Task Timer:
 * Finds open session for taskId (or any open session), sets end_at = now() and calculates duration_seconds.
 */
export async function stopTaskTimer(taskId?: string): Promise<{ success: boolean; durationSeconds: number }> {
  const now = new Date().toISOString();

  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder")) {
      let totalDuration = 0;
      inMemoryTrackings.forEach((session) => {
        if (!session.endAt && (!taskId || session.taskId === taskId)) {
          session.endAt = now;
          const duration = Math.floor((new Date(now).getTime() - new Date(session.startAt).getTime()) / 1000);
          session.durationSeconds = duration;
          totalDuration += duration;

          const t = inMemoryTasks.find((item) => item.id === session.taskId);
          if (t) {
            t.totalDurationSeconds = (t.totalDurationSeconds || 0) + duration;
          }
        }
      });
      return { success: true, durationSeconds: totalDuration };
    }

    let query = supabaseAdmin.from("time_trackings").select("*").is("end_at", null);
    if (taskId) query = query.eq("task_id", taskId);

    const { data: openSessions } = await query;
    let accumulated = 0;

    if (openSessions && openSessions.length > 0) {
      for (const s of openSessions) {
        const start = new Date(s.start_at).getTime();
        const duration = Math.floor((Date.now() - start) / 1000);
        accumulated += duration;

        await supabaseAdmin
          .from("time_trackings")
          .update({ end_at: now, duration_seconds: duration })
          .eq("id", s.id);
      }
    }

    return { success: true, durationSeconds: accumulated };
  } catch (err) {
    console.warn("[DB Fallback] stopTaskTimer in memory due to error:", err);
    return { success: true, durationSeconds: 0 };
  }
}

export async function getSystemHealthFromDB(): Promise<'connected' | 'disconnected'> {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder")) {
      return 'disconnected';
    }
    const { error } = await supabaseAdmin.from("_health_check").select("count").limit(1);
    if (error && error.code !== "PGRST116" && error.code !== "42P01") {
      console.warn("DB Health check response:", error.message);
    }
    return 'connected';
  } catch (err) {
    return 'disconnected';
  }
}

export async function fetchUserById(userId: string): Promise<UserProfile | null> {
  try {
    const { data, error } = await supabaseAdmin
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error || !data) return null;
    return data as UserProfile;
  } catch (err) {
    return null;
  }
}
