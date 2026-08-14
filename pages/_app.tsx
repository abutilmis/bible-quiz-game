import '../styles/globals.css';
import type { AppProps } from 'next/app';
import Head from 'next/head';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>Bible Quiz | Test Your Scripture Knowledge</title>
        <meta
          name="description"
          content="Play the Bible Quiz and compete for top scores. Answer scripture questions, track your rank, and join the quiz challenge."
        />
        <link rel="icon" href="https://bible-quiz-games.vercel.app/favicon.ico" />
      </Head>
      <Component {...pageProps} />
    </>
  );
}