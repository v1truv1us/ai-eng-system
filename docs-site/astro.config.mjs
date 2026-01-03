import mdx from "@astrojs/mdx";
import starlight from "@astrojs/starlight";
// @ts-check
import { defineConfig } from "astro/config";

import sitemap from "@astrojs/sitemap";

// https://astro.build/config
export default defineConfig({
    site: "https://v1truv1us.github.io/ai-eng-system/",
    integrations: [
        starlight({
            title: "ai-eng-system",
            description:
                "Advanced engineering toolkit with 29 specialized agents, 17 commands, and 7 skills",
            locales: {
                root: {
                    label: "English",
                    lang: "en",
                },
            },
            sidebar: [
                {
                    label: "Getting Started",
                    items: [
                        {
                            label: "Quick Start",
                            link: "getting-started/quick-start",
                        },
                        {
                            label: "Installation",
                            link: "getting-started/installation",
                        },
                        {
                            label: "Configuration",
                            link: "configuration/config-file",
                        },
                    ],
                },
                {
                    label: "Features",
                    items: [
                        {
                            label: "Prompt Optimization",
                            link: "features/prompt-optimization",
                        },
                        {
                            label: "Agent Coordination",
                            link: "features/agent-coordination",
                        },
                        { label: "Skills System", link: "features/skills" },
                    ],
                },
                {
                    label: "Reference",
                    items: [
                        { label: "Agents", link: "reference/agents" },
                        { label: "Commands", link: "reference/commands" },
                        { label: "Skills", link: "reference/skills" },
                    ],
                },
                {
                    label: "Architecture",
                    items: [
                        {
                            label: "Plugin Structure",
                            link: "architecture/plugin-structure",
                        },
                        {
                            label: "Hooks System",
                            link: "architecture/hooks-system",
                        },
                        {
                            label: "Marketplace",
                            link: "architecture/marketplace",
                        },
                        {
                            label: "Build System",
                            link: "architecture/build-system",
                        },
                    ],
                },
                {
                    label: "Development",
                    items: [
                        {
                            label: "Contributing",
                            link: "development/contributing",
                        },
                        { label: "Testing", link: "development/testing" },
                    ],
                },
                {
                    label: "Troubleshooting",
                    items: [
                        {
                            label: "Common Issues",
                            link: "troubleshooting/common-issues",
                        },
                        {
                            label: "Verification",
                            link: "troubleshooting/verification",
                        },
                    ],
                },
            ],
            editLink: {
                baseUrl:
                    "https://github.com/v1truv1us/ai-eng-system/edit/main/docs-site/src/content/docs/",
            },
            lastUpdated: true,
        }),
        sitemap(),
    ],
});
