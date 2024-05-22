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

interface DetailsPageProps {
  anime: Media;
}

const DetailsPage: NextPage<DetailsPageProps> = ({ anime }) => {
  const user = useUser();
  const { locale } = useRouter();
  


  const nextAiringSchedule = useMemo(
    () =>
      anime?.airingSchedule?.nodes
        ?.sort((a, b) => a.episode - b.episode)
        .find((schedule) => dayjs.unix(schedule.airingAt).isAfter(dayjs())),
    [anime?.airingSchedule]
  );

  const nextAiringScheduleTime = useMemo(() => {
    if (!nextAiringSchedule?.airingAt) return null;

    return dayjs.unix(nextAiringSchedule.airingAt).locale(locale).fromNow();
  }, [nextAiringSchedule?.airingAt, locale]);

  const title = useMemo(() => getTitle(anime, locale), [anime, locale]);
  const description = useMemo(
    () => getDescription(anime, locale),
    [anime, locale]
  );

  useEffect(() => {
    if (!anime) return;

    const syncDataScript = document.querySelector("#syncData");

    syncDataScript.textContent = JSON.stringify({
      title: anime.title.userPreferred,
      aniId: Number(anime.id),
      episode: null,
      id: anime.id,
      nextEpUrl: null,
    });
  }, [anime]);

  return <>
    <Head
      title={`${title} - Exoexs`}
      description={description}
      image={anime.bannerImage}
    />

    <div className="pb-8">
      <DetailsBanner image={anime.bannerImage} />

      <Section className="relative pb-4 bg-background-900">
        <div className="flex flex-row md:space-x-8">
          <div className="shrink-0 relative md:static md:left-0 md:-translate-x-0 w-[120px] md:w-[186px] -mt-20 space-y-6">
            <PlainCard src={anime.coverImage.extraLarge} alt={title} />

            {user && !isMobile && (
              <div className="hidden md:flex items-center space-x-1">
                <SourceStatus type={MediaType.Anime} source={anime} />
                <NotificationButton type={MediaType.Anime} source={anime} />
              </div>
            )}
          </div>

          <div className="flex flex-col justify-between md:py-4 ml-4 text-left items-start md:-mt-16 space-y-4">
            <div className="flex flex-col items-start space-y-4 md:no-scrollbar">
              <div className="hidden md:flex items-center flex-wrap gap-2 mb-4">
                
              </div>

              <p className="mb-2 text-2xl md:text-3xl font-semibold">
                {title}
              </p>

              <DotList>
                {anime.genres.map((genre) => (
                  <span key={genre}>
                    {convert(genre, "genre", { locale })}
                  </span>
                ))}
              </DotList>

              <MediaDescription
                description={description}
                containerClassName="mt-4 mb-8 md:block"
                className="text-gray-300 hover:text-gray-100 transition duration-300"
              />

              {/* MAL-Sync UI */}
              <div id="mal-sync" className="hidden md:block"></div>
            </div>

            <div className="hidden md:flex gap-x-8 overflow-x-auto md:gap-x-16 [&>*]:shrink-0">
              <InfoItem
                title="Country"
                value={convert(anime.countryOfOrigin, "country", { locale })}
              />
              <InfoItem
                title="Total Episodes"
                value={anime.episodes}
              />

              {anime.duration && (
                <InfoItem
                  title="Duration"
                  value={`${anime.duration} ${"Minutes"}`}
                />
              )}

              <InfoItem
                title="Status"
                value={convert(anime.status, "status", { locale })}
              />
              <InfoItem
                title="Age Rated"
                value={anime.isAdult ? "18+" : ""}
              />

              {nextAiringSchedule && (
                <InfoItem
                  className="!text-primary-300"
                  title="Next Airing Schedule"
                  value={`${"Episode"} ${
                    nextAiringSchedule.episode
                  }: ${nextAiringScheduleTime}`}
                />
              )}
            </div>
          </div>
        </div>

        <MediaDescription
          description={description}
          containerClassName="my-4 block md:hidden"
          className="text-gray-300 hover:text-gray-100 transition duration-300"
        />

        <div className="flex md:hidden items-center space-x-2 mb-4">
          {user && isMobile && (
            <SourceStatus type={MediaType.Anime} source={anime} />
          )}

          <Link
            href={`/anime/watch/${anime.id}`}
            className={classNames(!user && "flex-1")}>

            {user ? (
              <CircleButton secondary LeftIcon={BsFillPlayFill} />
            ) : (
              <Button
                primary
                LeftIcon={BsFillPlayFill}
                className="relative w-full"
              >
                <p className="!mx-0 absolute left-1/2 -translate-x-1/2">
                  Watch Now
                </p>
              </Button>
            )}

          </Link>
        </div>

        <div className="md:hidden flex gap-x-8 overflow-x-auto md:gap-x-16 [&>*]:shrink-0">
          <InfoItem
            title="Country"
            value={convert(anime.countryOfOrigin, "country", { locale })}
          />
          <InfoItem
            title="Total Episodes"
            value={anime.episodes}
          />

          {anime.duration && (
            <InfoItem
              title="Duration"
              value={`${anime.duration} ${"Minutes"}`}
            />
          )}

          <InfoItem
            title="Status"
            value={convert(anime.status, "status", { locale })}
          />
          <InfoItem
            title="Age Rated"
            value={anime.isAdult ? "18+" : ""}
          />

          {nextAiringSchedule && (
            <InfoItem
              className="!text-primary-300"
              title="Next Airing Schedule"
              value={`${"Episode"} ${
                nextAiringSchedule.episode
              }: ${nextAiringScheduleTime}`}
            />
          )}
        </div>
      </Section>

      <Section className="w-full min-h-screen gap-8 mt-2 md:mt-8 space-y-8 md:space-y-0 md:grid md:grid-cols-10 sm:px-12 md:no-scrollbar">
        <div className="md:col-span-2 xl:h-[max-content] space-y-4 md:no-scrollbar">
          <div className="flex flex-row md:flex-col overflow-x-auto bg-background-900 rounded-md md:p-4 gap-4 [&>*]:shrink-0 md:no-scrollbar">
            <InfoItem
              title="Format"
              value={convert(anime.format, "format", { locale })}
            />
            <InfoItem title="English" value={anime.title.english} />
            <InfoItem title="Native" value={anime.title.native} />
            <InfoItem title="Romanji" value={anime.title.romaji} />
            <InfoItem
              title="Popular"
              value={numberWithCommas(anime.popularity)}
            />
            <InfoItem
              title="Favourite"
              value={numberWithCommas(anime.favourites)}
            />
            <InfoItem
              title="Trending"
              value={numberWithCommas(anime.trending)}
            />

            <InfoItem
              title="Studio"
              value={anime.studios.nodes.map((studio) => (
                <p key={studio.id}>
                  <Link
                    href={createStudioDetailsUrl(studio)}
                    className="hover:text-primary-300 transition duration-300">

                    {studio.name}

                  </Link>
                </p>
              ))}
            />

            <InfoItem
              title="Season"
              value={`${convert(anime.season, "season", { locale })} ${
                anime.seasonYear
              }`}
            />
            <InfoItem
              title="Synonyms"
              value={anime.synonyms.map((synomym) => (

                                slug={epsData.id}
                            />
                            <div className="my-3 p-2 text-sm md:text-base border-kumanime border font-poppins">
                                <div className="flex gap-2 font-semibold items-center justify-center ">
                                    <p>Kualitas : </p>
                                    <button className={streamQuality === 'sd' ? `py-1 px-2 rounded-sm bg-kumanime` : `py-1 px-2 rounded-sm`} onClick={() => setStreamQuality('sd')}>SD 480p</button>
                                    <button className={streamQuality === 'hd' ? `py-1 px-2 rounded-sm bg-kumanime` : `py-1 px-2 rounded-sm`} onClick={() => setStreamQuality('hd')}>HD 720p</button>
                                </div>
                                <p className="text-center text-[11px] mt-2">*Kualitas HD tidak selalu ada karena limitasi akses ke server sumber</p>
                            </div>
                            <DetailCard
                                title={animeData.title}
                                poster={animeData?.thumb}
                                synopsis={animeData?.synopsis}
                                slug={animeData.anime_id}
                            />
                        </div>
                        <div className="my-6">
                            <Title>Rekomendasi Anime</Title>
                            <Slider>
                                {
                                    ongoingAnime.animeList.map((data, index) => {
                                        return(
                                            <div className="swiper-slide" key={index}>
                                                <Card
                                                    key={index}
                                                    imgUrl={data.thumb}
                                                    href={`/anime/${data.id}`}
                                                    title={data.title}
                                                    episode={data.episode}
                                                    rating="Baru"
                                                />
                                            </div>
                                        )
                                    })
                                }
                            </Slider>
                        </div>
                    </div>
                    <div className="lg:col-span-3 mt-0 lg:mt-16 px-3">
                        <Title>Berita</Title>
                        <div className="bg-bg-kumanime-semi">
                            <Aside>
                                {
                                    newsAnimeData ? (newsAnimeData.slice(0, 5).map((data, index) => {
                                        return (
                                            <AsideCard
                                                key={index}
                                                imgUrl={data.thumbnail}
                                                title={data.title}
                                                href={data.url}
                                                topics={data.topics}
                                                uploaded={data.uploadedAt}
                                            />
                                        )
                                    })) : <p>Loading...</p>
                                }
                            </Aside>
                        </div>
                    </div>
                </div>
                </>
            ) : (
                <Loading />
            )}
        </>
    );
}

export default Watch
