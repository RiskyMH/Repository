import Head from "next/head";


export default function Main() {
  return (
    <div>
      <Head>
        <title>RiskyAPI</title>
        <meta name="description" content="An API..." />
        {/* <link rel="icon" href="/favicon.ico" /> */}
        <meta property="og:title" content="RiskyAPI" />
        <meta property="og:description" content="An API..." />
      </Head>

      <main>
        <h1>
          RiskyAPI
        </h1>
        <p>
          An API...
        </p>
      </main>

    </div>
  );
}
