import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  deleteCategory,
  deleteLut,
  getCategories,
  getLuts,
  getRemoteConfig,
  resetRemoteConfigFromLuts,
  saveCategory,
  saveLut,
  saveRemoteConfig,
} from "./store";

export const adminQueryKeys = {
  luts: ["admin", "luts"] as const,
  categories: ["admin", "categories"] as const,
  remoteConfig: ["admin", "remote-config"] as const,
};

export function useAdminLutsQuery() {
  return useQuery({ queryKey: adminQueryKeys.luts, queryFn: getLuts });
}

export function useAdminCategoriesQuery() {
  return useQuery({
    queryKey: adminQueryKeys.categories,
    queryFn: getCategories,
  });
}

export function useAdminRemoteConfigQuery() {
  return useQuery({
    queryKey: adminQueryKeys.remoteConfig,
    queryFn: getRemoteConfig,
  });
}

export function useSaveLutMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: saveLut,
    onSuccess: (luts) => {
      queryClient.setQueryData(adminQueryKeys.luts, luts);
      void queryClient.invalidateQueries({ queryKey: adminQueryKeys.remoteConfig });
    },
  });
}

export function useDeleteLutMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteLut,
    onSuccess: (luts) => {
      queryClient.setQueryData(adminQueryKeys.luts, luts);
      void queryClient.invalidateQueries({ queryKey: adminQueryKeys.remoteConfig });
    },
  });
}

export function useSaveCategoryMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: saveCategory,
    onSuccess: (categories) => {
      queryClient.setQueryData(adminQueryKeys.categories, categories);
      void queryClient.invalidateQueries({ queryKey: adminQueryKeys.remoteConfig });
    },
  });
}

export function useDeleteCategoryMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteCategory,
    onSuccess: (categories) => {
      queryClient.setQueryData(adminQueryKeys.categories, categories);
      void queryClient.invalidateQueries({ queryKey: adminQueryKeys.remoteConfig });
    },
  });
}

export function usePublishRemoteConfigMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: saveRemoteConfig,
    onSuccess: (config) => {
      queryClient.setQueryData(adminQueryKeys.remoteConfig, config);
    },
  });
}

export function useRegroupRemoteConfigMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: resetRemoteConfigFromLuts,
    onSuccess: (config) => {
      queryClient.setQueryData(adminQueryKeys.remoteConfig, config);
    },
  });
}
