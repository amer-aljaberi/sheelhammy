import { MetadataRoute } from "next";

const getSiteUrl = () => {
  return process.env.NEXTAUTH_URL || process.env.SITE_URL || "https://sheelhammy.com";
};

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl();
  
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/dashboard/", "/admin/", "/auth/", "/ref/"],
      },
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: ["/api/", "/dashboard/", "/admin/", "/auth/", "/ref/"],
      },
      {
        userAgent: "Bingbot",
        allow: "/",
        disallow: ["/api/", "/dashboard/", "/admin/", "/auth/", "/ref/"],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
