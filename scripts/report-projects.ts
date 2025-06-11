import Bun from "bun";

const ORG_NAME = "projectm-visualizer";
const GH_TOKEN = process.env.GH_TOKEN;
const OUTPUT_FILE = "content/projects.json";

if (!GH_TOKEN) {
    console.error("❌ Please set the GH_TOKEN environment variable.");
    process.exit(1);
}

const headers = {
    Accept: "application/vnd.github+json",
    Authorization: `Bearer ${GH_TOKEN}`,
    "X-GitHub-Api-Version": "2022-11-28",
};

async function fetchAll<T>(url: string): Promise<T[]> {
    let results: T[] = [];
    let page = 1;

    while (true) {
        const response = await fetch(`${url}?per_page=100&page=${page}`, { headers });
        if (!response.ok) throw new Error(`Failed to fetch ${url}: ${response.statusText}`);

        const data: T[] = await response.json();
        results = results.concat(data);

        const linkHeader = response.headers.get("link");
        if (!linkHeader || !linkHeader.includes('rel="next"')) break;

        page++;
    }

    return results;
}

type Repository = {
    id: number;
    name: string;
    full_name: string;
    private: boolean;
    description: string | null;
    fork: boolean;
    created_at: string;
    updated_at: string;
    pushed_at: string;
    homepage: string | null;
    size: number;
    stargazers_count: number;
    watchers_count: number;
    language: string | null;
    forks_count: number;
    open_issues_count: number;
    default_branch: string;
    archived: boolean;
    disabled: boolean;
    visibility: string;
    topics?: string[];
    [key: string]: unknown; // in case GitHub adds fields we don’t explicitly type
};

async function getAllRepos(): Promise<Repository[]> {
    return fetchAll<Repository>(`https://api.github.com/orgs/${ORG_NAME}/repos`);
}

async function enrichWithTopics(repos: Repository[]): Promise<Repository[]> {
    const enriched: Repository[] = [];

    for (const repo of repos) {
        try {
            const response = await fetch(
                `https://api.github.com/repos/${ORG_NAME}/${repo.name}/topics`,
                {
                    headers: {
                        ...headers,
                        Accept: "application/vnd.github.mercy-preview+json",
                    },
                }
            );

            if (!response.ok) {
                console.warn(`⚠️ Failed to fetch topics for ${repo.name}: ${response.statusText}`);
                enriched.push(repo);
                continue;
            }

            const topicData = await response.json();
            repo.topics = topicData.names || [];
        } catch (err) {
            console.warn(`⚠️ Error fetching topics for ${repo.name}: ${(err as Error).message}`);
        }

        enriched.push(repo);
    }

    return enriched;
}

async function main() {
    console.log(`📦 Fetching repositories for org: ${ORG_NAME}`);
    const repos = await getAllRepos();

    console.log(`🔍 Enriching ${repos.length} repositories with topics...`);
    const enriched = await enrichWithTopics(repos);

    await Bun.write(OUTPUT_FILE, JSON.stringify(enriched, null, 2));
    console.log(`✅ Done. ${enriched.length} repositories written to projects.json`);
}

main().catch((err) => {
    console.error("❌ Unexpected error:", err);
    process.exit(1);
});