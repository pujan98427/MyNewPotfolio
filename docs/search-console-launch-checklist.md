# Google Search Console launch checklist

The application is prepared for Google Search Console verification, but no verification token is invented or committed.

## Before deployment

1. Set `NEXT_PUBLIC_SITE_URL` to the final canonical HTTPS origin.
2. Copy only the content value supplied for Google’s HTML verification tag into:

   ```text
   NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=
   ```

3. Do not paste the complete `<meta>` element. Next.js generates that element through its Metadata API.
4. Build and deploy the same hostname represented by `NEXT_PUBLIC_SITE_URL`.

## After deployment

1. Add the final domain or URL-prefix property in Google Search Console.
2. Complete ownership verification using the configured method. Domain properties may require DNS verification; the metadata token supports the HTML-tag method for an appropriate URL-prefix property.
3. Confirm the deployed homepage contains one `google-site-verification` meta tag with the supplied value.
4. Submit `/sitemap.xml` and confirm Google can fetch it successfully.
5. Use URL Inspection for the homepage, `/work`, important case studies, `/lab`, `/lab/web-doctor`, the SVG/Base64 converter after launch, and the strongest guides.
6. Request indexing for the most important new or substantially changed canonical pages. Do not treat submission as guaranteed or immediate indexing.
7. Monitor Page indexing, Sitemaps, Core Web Vitals and crawl-related reports after the migration.
8. Compare Google-selected canonicals with the declared canonical URLs and investigate conflicting redirects, internal links or sitemap entries.

Keep the verification environment variable in the deployment configuration for as long as that verification method is needed. Never commit an unknown token or reuse a token from an unrelated property.

