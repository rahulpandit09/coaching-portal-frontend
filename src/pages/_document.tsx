import Document, { Html, Head, Main, NextScript } from "next/document"

class MyDocument extends Document {
  render() {
    return (
      <Html lang="en" className="min-h-full">
        <Head>
          <meta name="application-name" content="GrowPortal" />
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
          <meta name="apple-mobile-web-app-title" content="GrowPortal" />
          <meta name="theme-color" content="#4F46E5" />

          {/* Theme Restorer Script (anti-flash) */}
          <script
            dangerouslySetInnerHTML={{
              __html: `
                (function () {
                  try {
                    const theme = localStorage.getItem("theme") || "light";
                    document.documentElement.setAttribute("data-theme", theme);
                  } catch (e) {}
                })();
              `,
            }}
          />
        </Head>
        <body className="min-h-full bg-base-200 dark:bg-slate-900 transition-colors duration-200">
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}

export default MyDocument
