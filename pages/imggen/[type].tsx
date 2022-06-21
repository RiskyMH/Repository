// This file is for showing the data from /pages/api/imggen/[type].ts
import Head from "next/head";


export default function ImgGen({type}: {type: string}) {
  return (
    <div>
      <Head>
        <title>RiskyAPI | Image Generation | {type}</title>
        <meta name="description" content="An API..." />
        {/* <link rel="icon" href="/favicon.ico" /> */}
        <meta property="og:title" content={`RiskyAPI | Image Generation | ${type}`}/>
        <meta property="og:description" content="An API..." />
      </Head>

      <main>
        <h1>
            RiskyAPI | Image Generation{type? ` | ${type}`: ""}
        </h1>
        <p>
            An API... <a href={"/api/imggen/"+ type}>(go to the api page)</a>
        </p>
      </main>

    </div>
  );
}


export async function getServerSideProps({query}) {
  return {
    props: {
        type: query.type
    },
  };
}