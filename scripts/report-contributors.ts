import Bun from "bun";

const ORG_NAME = "projectm-visualizer";
const GH_TOKEN = process.env.GH_TOKEN;
const OUTPUT_FILE = "content/contributors.json";

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

type Contributor = {
    id: number;
    login: string;
    avatar_url: string;
    html_url: string;
};

async function getOrgRepos(): Promise<string[]> {
    const repos = await fetchAll<{ name: string }>(`https://api.github.com/orgs/${ORG_NAME}/repos`);
    return repos.map((repo) => repo.name);
}

async function getRepoContributors(repo: string): Promise<Contributor[]> {
    return fetchAll<Contributor>(
        `https://api.github.com/repos/${ORG_NAME}/${repo}/contributors`
    );
}

async function main() {
    console.log(`📦 Fetching repositories for org: ${ORG_NAME}`);
    const repoNames = await getOrgRepos();

    const allContributors: Map<number, Contributor> = new Map();

    for (const repo of repoNames) {
        console.log(`🔍 Fetching contributors for repo: ${repo}`);
        try {
            const contributors = await getRepoContributors(repo);
            for (const user of contributors) {
                if (!allContributors.has(user.id)) {
                    allContributors.set(user.id, {
                        id: user.id,
                        login: user.login,
                        avatar_url: user.avatar_url,
                        html_url: user.html_url,
                    });
                }
            }
        } catch (error) {
            console.warn(`⚠️ Skipping ${repo}: ${(error as Error).message}`);
        }
    }

    const result = Array.from(allContributors.values());
    await Bun.write(OUTPUT_FILE, JSON.stringify(result, null, 2));
    console.log(`✅ Done. ${result.length} unique contributors written to contributors.json`);
}

main().catch((err) => {
    console.error("❌ Unexpected error:", err);
    process.exit(1);
});