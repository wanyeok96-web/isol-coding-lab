import programsJson from "@/data/programs.json";
import makersJson from "@/data/makers.json";
import ideasJson from "@/data/ideas.json";
import guidesJson from "@/data/guides.json";
import { comparePrograms } from "@/lib/format";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";
import { createServerSupabase } from "@/lib/supabase-server";

async function getDataClient() {
  const serverClient = await createServerSupabase();
  if (serverClient) return serverClient;
  if (isSupabaseConfigured()) return getSupabase();
  return null;
}

function mapMaker(row) {
  return {
    id: row.id,
    name: row.name,
    subject: row.subject,
    bio: row.bio,
    profileImage: row.profile_image || row.profileImage || "",
  };
}

function mapProgram(row) {
  const makerIds = Array.isArray(row.makerIds)
    ? row.makerIds
    : (row.program_makers || []).map((item) => item.maker_id);

  return {
    id: row.id,
    title: row.title,
    subtitle: row.subtitle || "",
    description: row.description || "",
    background: row.background || "",
    category: row.category,
    tags: row.tags || [],
    tools: row.tools || [],
    thumbnail: row.thumbnail || "",
    url: row.url || "",
    github: row.github || "",
    visibility: row.visibility || "public",
    featured: Boolean(row.featured),
    likes: Number(row.likes || 0),
    createdAt: row.created_at || row.createdAt || "",
    ownerEmail: row.owner_email || row.ownerEmail || "",
    makerIds,
  };
}

function jsonPublicPrograms() {
  return programsJson
    .filter((program) => program.visibility !== "private")
    .slice()
    .sort(comparePrograms);
}

export async function getPublicPrograms() {
  const client = await getDataClient();
  if (!client) {
    return jsonPublicPrograms();
  }

  const { data, error } = await client
    .from("programs")
    .select("*, program_makers(maker_id)")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`프로그램을 불러오지 못했습니다: ${error.message}`);
  }

  return (data || []).map(mapProgram);
}

export async function getFeaturedPrograms() {
  const programs = await getPublicPrograms();
  return programs.filter((program) => program.featured).slice(0, 3);
}

export async function getProgramById(id) {
  const client = await getDataClient();
  if (!client) {
    const program = programsJson.find((item) => item.id === id) || null;
    if (!program || program.visibility === "private") return null;
    return program;
  }

  const { data, error } = await client
    .from("programs")
    .select("*, program_makers(maker_id)")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(`프로그램을 불러오지 못했습니다: ${error.message}`);
  }

  if (!data || data.visibility === "private") return null;
  return mapProgram(data);
}

export async function getMakers() {
  const client = await getDataClient();
  if (!client) {
    return makersJson;
  }

  const { data, error } = await client.from("makers").select("*").order("name");

  if (error) {
    throw new Error(`제작자를 불러오지 못했습니다: ${error.message}`);
  }

  return (data || []).map(mapMaker);
}

export async function getMakerById(id) {
  const makers = await getMakers();
  return makers.find((maker) => maker.id === id) || null;
}

export async function getMakersById() {
  const makers = await getMakers();
  return Object.fromEntries(makers.map((maker) => [maker.id, maker]));
}

export async function getProgramsByMaker(makerId) {
  const programs = await getPublicPrograms();
  return programs.filter((program) => Array.isArray(program.makerIds) && program.makerIds.includes(makerId));
}

export async function getRelatedPrograms(currentProgram) {
  const programs = await getPublicPrograms();
  const tags = new Set(currentProgram.tags || []);

  return programs
    .filter((program) => program.id !== currentProgram.id)
    .map((program) => {
      let score = 0;
      if (program.category === currentProgram.category) score += 2;
      (program.tags || []).forEach((tag) => {
        if (tags.has(tag)) score += 1;
      });
      return { ...program, _score: score };
    })
    .filter((program) => program._score > 0)
    .sort((a, b) => b._score - a._score || comparePrograms(a, b))
    .slice(0, 3);
}

export async function getMakersForList() {
  const [makers, programs] = await Promise.all([getMakers(), getPublicPrograms()]);

  return makers
    .map((maker) => ({
      ...maker,
      programCount: programs.filter((program) => program.makerIds.includes(maker.id)).length,
    }))
    .sort((a, b) => b.programCount - a.programCount);
}

function mapIdea(row) {
  const developerIds = Array.isArray(row.developerIds)
    ? row.developerIds
    : (row.idea_developers || []).map((item) => item.maker_id);

  return {
    id: row.id,
    title: row.title,
    description: row.description || "",
    category: row.category,
    author: row.author || "",
    authorEmail: row.author_email || row.authorEmail || "",
    likes: Number(row.likes || 0),
    status: row.status || "open",
    developerIds,
    programId: row.program_id || row.programId || null,
  };
}

function jsonIdeas() {
  return ideasJson.slice().sort((a, b) => b.likes - a.likes);
}

export async function getIdeas() {
  const client = await getDataClient();
  if (!client) {
    return jsonIdeas();
  }

  const { data, error } = await client
    .from("ideas")
    .select("*, idea_developers(maker_id)")
    .order("created_at", { ascending: false });

  if (error) {
    return jsonIdeas();
  }

  return (data || []).map(mapIdea);
}

export async function getIdeaById(id) {
  const ideas = await getIdeas();
  return ideas.find((idea) => idea.id === id) || null;
}

export async function getGuides() {
  return guidesJson.slice().sort((a, b) => a.order - b.order);
}
