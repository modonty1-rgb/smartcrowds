'use server';

import { prisma } from '@/lib/prisma';

export async function getDashboardStats() {
  try {
    const [
      totalProjects,
      publishedProjects,
      totalPosts,
      publishedPosts,
      recentProjects,
      recentPosts,
    ] = await Promise.all([
      // Total projects
      prisma.project.count(),
      // Published projects
      prisma.project.count({ where: { published: true } }),
      // Total blog posts
      prisma.post.count(),
      // Published blog posts
      prisma.post.count({ where: { published: true } }),
      // Recent projects (last 5)
      prisma.project.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          nameAr: true,
          slug: true,
          locale: true,
          createdAt: true,
          published: true,
        },
      }),
      // Recent posts (last 5)
      prisma.post.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          title: true,
          titleAr: true,
          slug: true,
          locale: true,
          createdAt: true,
          published: true,
        },
      }),
    ]);

    // Calculate changes (mock for now, can be improved with date filtering)
    const projectChange = '+0';
    const postChange = '+0';

    return {
      projects: {
        total: totalProjects,
        published: publishedProjects,
        change: projectChange,
      },
      posts: {
        total: totalPosts,
        published: publishedPosts,
        change: postChange,
      },
      recentProjects,
      recentPosts,
    };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return {
      projects: { total: 0, published: 0, change: '+0' },
      posts: { total: 0, published: 0, change: '+0' },
      recentProjects: [],
      recentPosts: [],
    };
  }
}






















