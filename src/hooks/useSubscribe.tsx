//@ts-nocheck
import { useUser } from "@/contexts/AuthContext";
import supabaseClient from "@/lib/supabase";

import { Media, MediaType } from "@/types/anilist";
import { getTitle } from "@/utils/data";
import { PostgrestError } from "@supabase/supabase-js";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import { useMemo } from "react";
import { useMutation, useQueryClient } from "react-query";
import { toast } from "react-toastify";

const useSubscribe = <T extends MediaType>(type: T, source: Media) => {
  const user = useUser();
  const queryClient = useQueryClient();
  const { locale } = useRouter();
  const { t } = useTranslation("notification");

  const mediaTitle = useMemo(() => getTitle(source, locale), [locale, source]);

  const tableName =
    type === MediaType.Anime
      ? "kaguya_anime_subscribers"
      : "kaguya_manga_subscribers";
  const queryKey = ["is_subscribed", user.id, source.id];

  return useMutation<any, PostgrestError, any, any>(
    async () => {
      const { data, error } = await supabaseClient
        .from(tableName)
        .upsert({ userId: user.id, mediaId: source.id });

      if (error) throw error;

      return data;
    },
    {
      onMutate: () => {
        queryClient.setQueryData(queryKey, true);
      },
      onSuccess: () => {
        toast.success(t("subscribed_msg", { mediaTitle }));
      },
      onError: (error) => {
        toast.error(error.message);
      },
      onSettled: () => {
        queryClient.invalidateQueries(queryKey);
      },
    }
  );
};

export default useSubscribe;
