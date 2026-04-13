import { Helmet } from 'react-helmet-async';

const BASE_URL = 'https://meierms.com';
const DEFAULT_IMAGE = `${BASE_URL}/logo512.png`;
const SITE_NAME = 'Maycon Meier Portfolio';

/**
 * Drop-in SEO component — add to the top of any page.
 * All props are optional; sensible defaults are applied.
 */
function SEO({
  title,
  description,
  path = '/',
  image = DEFAULT_IMAGE,
  type = 'website',
  noIndex = false,
}) {
  const fullTitle = title
    ? `${title} | Maycon Meier`
    : 'Maycon Meier - Personal Portfolio | Finance & Technology Platform';

  const fullDescription =
    description ||
    'Personal portfolio of Maycon Meier featuring advanced finance tools, stock analysis, portfolio tracking, unit converters, and modern web development projects.';

  const canonicalUrl = `${BASE_URL}${path}`;

  return (
    <Helmet>
      {/* Primary */}
      <title>{fullTitle}</title>
      <meta name="description" content={fullDescription} />
      <link rel="canonical" href={canonicalUrl} />
      {noIndex && <meta name="robots" content="noindex, nofollow" />}

      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={fullDescription} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content={SITE_NAME} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={canonicalUrl} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={fullDescription} />
      <meta name="twitter:image" content={image} />
    </Helmet>
  );
}

export default SEO;
