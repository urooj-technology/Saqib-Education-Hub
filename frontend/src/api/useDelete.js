// src/api/useDelete.js
import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { AlertTriangle, X } from "lucide-react";
import { toast } from "react-toastify";

const useDelete = (queryKey, token) => {
  const queryClient = useQueryClient();
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const headers = token ? { Authorization: `Token ${token}` } : {};
      const baseUrl = process.env.NEXT_PUBLIC_API_URL;
      
      const apiUrl = baseUrl.endsWith('/api') 
        ? `${baseUrl}/${queryKey}/${id}` 
        : `${baseUrl}/api/${queryKey}/${id}`;
      
      await axios.delete(apiUrl, { headers });
    },
    onSuccess: () => {
      toast.success("Item deleted successfully", {
        position: "top-right",
        autoClose: 3000,
      });
      
      // Invalidate the specific query key
      queryClient.invalidateQueries(queryKey);
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message || error.response?.data?.detail || "Failed to delete item",
        {
          position: "top-right",
          autoClose: 3000,
        }
      );
    },
  });

  const handleDelete = (id) => {
    setItemToDelete(id);
    setConfirmDialogOpen(true);
  };

  const confirmDelete = () => {
    deleteMutation.mutate(itemToDelete);
    setConfirmDialogOpen(false);
  };

  const ConfirmDialog = ({
    message = `Are you sure you want to delete this ${queryKey.slice(0, -1)}? This action cannot be undone.`,
  }) => {
    if (!confirmDialogOpen) return null;

    return (
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex min-h-screen items-center justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
          {/* Background overlay */}
          <div 
            className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
            onClick={() => setConfirmDialogOpen(false)}
          ></div>

          {/* Modal panel */}
          <div className="inline-block transform overflow-hidden rounded-lg bg-white text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:align-middle">
            {/* Header */}
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="sm:flex sm:items-start">
                <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                  <h3 className="text-lg font-medium leading-6 text-gray-900">
                    Confirm Deletion
                  </h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      {message}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
              <button
                type="button"
                className="inline-flex w-full justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
                onClick={confirmDelete}
              >
                Delete
              </button>
              <button
                type="button"
                className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                onClick={() => setConfirmDialogOpen(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return { handleDelete, ConfirmDialog };
};

export default useDelete;
  