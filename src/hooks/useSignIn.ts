import supabaseClient from "@/lib/supabase";

interface UseSignInOptions {
  redirectTo?: string;
  scopes?: string;
}

const useSignIn = (supabaseOptions?: UseSignInOptions) => {
  return useMutation((provider: Provider) => {
    return supabaseClient.auth.signIn(
      {
        provider,
      },
      supabaseOptions
    );
  });
};

export default useSignIn;
