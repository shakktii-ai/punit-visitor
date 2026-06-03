import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        <meta name="description" content="Visitor Management System" />
        <meta name="theme-color" content="#0F172A" />
      </Head>
      <body className="bg-dark-900 antialiased">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
