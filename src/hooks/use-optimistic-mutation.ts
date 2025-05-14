
import { useMutation, useQueryClient, UseMutationOptions } from '@tanstack/react-query';

export interface OptimisticMutationOptions<TData, TVariables, TContext, TError> {
  // The key of the query to update optimistically
  queryKey: string[];
  // Function to compute the optimistic update
  getOptimisticData: (variables: TVariables, oldData: TData) => TData;
  // The actual mutation function
  mutationFn: (variables: TVariables) => Promise<TContext>;
  // Optional onSuccess handler
  onSuccess?: (data: TContext, variables: TVariables, context: unknown) => void;
  // Optional onError handler
  onError?: (error: TError, variables: TVariables, context: unknown) => void;
  // Optional onSettled handler
  onSettled?: (data: TContext | undefined, error: TError | null, variables: TVariables, context: unknown) => void;
}

export function useOptimisticMutation<TData, TVariables, TContext, TError = Error>(
  options: OptimisticMutationOptions<TData, TVariables, TContext, TError>
) {
  const queryClient = useQueryClient();
  
  const mutationOptions: UseMutationOptions<TContext, TError, TVariables, { previousData: TData }> = {
    mutationFn: options.mutationFn,
    
    // Setup optimistic update
    onMutate: async (variables) => {
      // Cancel any outgoing refetches to avoid overwriting optimistic update
      await queryClient.cancelQueries({ queryKey: options.queryKey });
      
      // Snapshot the previous value
      const previousData = queryClient.getQueryData<TData>(options.queryKey);
      
      // Optimistically update to the new value
      if (previousData) {
        queryClient.setQueryData(
          options.queryKey, 
          options.getOptimisticData(variables, previousData)
        );
      }
      
      // Return a context with the previous data to use for rollback
      return { previousData };
    },
    
    // On error, roll back
    onError: (err, variables, context) => {
      // Restore previous data on error
      if (context?.previousData) {
        queryClient.setQueryData(options.queryKey, context.previousData);
      }
      
      // Call user's onError if provided
      if (options.onError) {
        options.onError(err, variables, context);
      }
    },
    
    // On success, invalidate affected queries to refetch fresh data
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: options.queryKey });
      
      // Call user's onSuccess if provided
      if (options.onSuccess) {
        options.onSuccess(data, variables, context);
      }
    },
    
    // On settled (either success or error)
    onSettled: (data, error, variables, context) => {
      if (options.onSettled) {
        options.onSettled(data, error, variables, context);
      }
    },
  };
  
  return useMutation(mutationOptions);
}
