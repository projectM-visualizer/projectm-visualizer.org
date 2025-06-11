export { default as Projects } from './Projects.vue'

export interface ProjectItem {
    id: number;
    html_url: string;
    name: string;
    full_name: string;
    description: string;
    owner: {
        login: string;
        avatar_url: string;
    },
    updated_at: string;
    stargazers_count: number;
    forks_count: number;
}

export interface ProjectsProps {
    items: ProjectItem[];
    itemsToShow: number;
    sortBy: 'name' | 'updated' | 'stars' | 'forks';
    featured: string[];

}