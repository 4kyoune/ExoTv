//@ts-nocheck
import Button from "@/components/shared/Button";
import Card from "@/components/shared/Card";
import CharacterConnectionCard from "@/components/shared/CharacterConnectionCard";
import CircleButton from "@/components/shared/CircleButton";
import DetailsBanner from "@/components/shared/DetailsBanner";
import DetailsSection from "@/components/shared/DetailsSection";
import DotList from "@/components/shared/DotList";
import Head from "@/components/shared/Head";
import InfoItem from "@/components/shared/InfoItem";
import List from "@/components/shared/List";
import MediaDescription from "@/components/shared/MediaDescription";
import NotificationButton from "@/components/shared/NotificationButton";
import PlainCard from "@/components/shared/PlainCard";
import Section from "@/components/shared/Section";
import SourceStatus from "@/components/shared/SourceStatus";
import { REVALIDATE_TIME } from "@/constants";
import { useUser } from "@/contexts/AuthContext";
import withRedirect from "@/hocs/withRedirect";
import dayjs from "@/lib/dayjs";
import { getMediaDetails } from "@/services/anilist";
import { Media, MediaType } from "@/types/anilist";
import {
  createStudioDetailsUrl,
  numberWithCommas,
} from "@/utils";
import { convert, getDescription, getTitle } from "@/utils/data";
import classNames from "classnames";
import { GetStaticProps, NextPage } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useMemo } from "react";
import { isMobile } from "react-device-detect";
import { BsFillPlayFill } from "react-icons/bs";

async function getInfo(id) {
  try {
    let cachedData;
    if (redis) {
      cachedData = await redis.get(`info:${id}`);
      if (!JSON.parse(cachedData)) {
        await redis.del(`info:${id}`);
        cachedData = null;
      }
    }
    if (cachedData) {
      return JSON.parse(cachedData);
    } else {
      const data = await AnimeInfoAnilist(id);
      const cacheTime = data?.nextAiringEpisode?.episode ? 60 * 60 * 2 : 60 * 60 * 24 * 45;
      if (redis && data !== null && data) {
        await redis.set(`info:${id}`, JSON.stringify(data), "EX", cacheTime);
      }
      return data;
    }
  } catch (error) {
    console.error("Error fetching info: ", error);
  }
}

export async function generateMetadata({ params, searchParams }) {
  const id =  searchParams?.id;
  const data = await getInfo(id);
  const epnum =  searchParams?.ep;

  return {
    title:"Episode "+ epnum + ' - ' + data?.title?.english || data?.title?.romaji || 'Loading...',
    description: data?.description?.slice(0,180),
    openGraph: {
      title:"Episode "+ epnum + ' - ' + data?.title?.english || data?.title?.romaji,
      images: [data?.coverImage?.extraLarge],
      description: data?.description,
    },
    twitter: {
      card: "summary",
      title:"Episode "+ epnum + ' - ' + data?.title?.english || data?.title?.romaji,
      description: data?.description?.slice(0,180),
    },
  }
}

export async function Ephistory(session, aniId, epNum){
  try {
    let savedep;
    if (session && aniId && epNum) {
      await createWatchEp(aniId, epNum);
      savedep = await getEpisode(aniId, epNum);
    }
    return savedep;
  } catch (error) {
    console.error(error);
    return null;
  }
};

async function AnimeWatch({ params, searchParams }) {
  const session = await getAuthSession();
  const id = searchParams.id;
  const provider = searchParams.host;
  const epNum = searchParams.ep;
  const epId = searchParams.epid;
  const subdub = searchParams.type;
  const data = await getInfo(id);
  const savedep = await Ephistory(session, id, epNum);
  // console.log(savedep)
  // console.log(data)

  return (
    <>
        <Navbarcomponent />
      <div className=" w-full flex flex-col lg:flex-row lg:max-w-[98%] mx-auto xl:max-w-[94%] lg:gap-[6px] mt-[70px]">
        <div className="flex-grow w-full h-full">
          <PlayerComponent id={id} epId={epId} provider={provider} epNum={epNum} data={data} subdub={subdub} session={session} savedep={savedep}/>
          {data?.status === 'RELEASING' &&
            <NextAiringDate nextAiringEpisode={data?.nextAiringEpisode} />
          }
        </div>
        <div className="h-full lg:flex lg:flex-col md:max-lg:w-full gap-10">
        {/* <div className="rounded-lg hidden lg:block lg:max-w-[280px] xl:max-w-[380px] w-[100%] xl:overflow-y-scroll xl:overflow-x-hidden overflow-hidden scrollbar-hide overflow-y-hidden">
            <PlayerAnimeCard data={data?.relations?.edges} id="Related Anime"/>
          </div> */}
          <div className="rounded-lg hidden lg:block lg:max-w-[280px] xl:max-w-[380px] w-[100%] xl:overflow-y-scroll xl:overflow-x-hidden overflow-hidden scrollbar-hide overflow-y-hidden">
            <PlayerAnimeCard data={data?.recommendations?.nodes} id="Recommendations"/>
          </div>
        </div>
        {/* <div className="lg:hidden">
        <Animecards data={data?.relations?.edges} cardid="Related Anime"/>
        </div> */}
        {/* <div className="lg:hidden">
        <Animecards data={data?.recommendations?.nodes} cardid={"Recommendations"}/>
        </div> */}
      </div>
    </>
  );
}

export default AnimeWatch;
