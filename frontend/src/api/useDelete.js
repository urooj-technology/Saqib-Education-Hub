// src/api/useDelete.js
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  IconButton,
} from "@mui/material";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import CloseIcon from "@mui/icons-material/Close";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
const useDelete = (queryKey, token) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const headers = token ? { Authorization: `Token ${token}` } : {};
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL || 'https://api.saqibeduhub.com/api'}/${queryKey}/${id}/`,
        { headers }
      );
    },
    onSuccess: () => {
      toast.success(t("api.deleteSuccess"), {
        position: "top-right",
        autoClose: 3000,
      });
      queryClient.invalidateQueries(queryKey);
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.detail || t("api.deleteError"),
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
    message = t(`${queryKey.endsWith('s') ? queryKey : queryKey + 's'}.deleteConfirmation`, { defaultValue: t("api.deleteConfirmation") }),
  }) => (
    <Dialog
      open={confirmDialogOpen}
      onClose={() => setConfirmDialogOpen(false)}
    >
      <DialogTitle>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 1,
          }}
        >
          <WarningAmberIcon color="error" sx={{ fontSize: "5rem" }} />
          <Typography variant="h5" fontWeight={"bold"}>
            {t("api.deleteConfirmationTitle")}
          </Typography>
        </Box>
      </DialogTitle>
      <DialogContent>{message}</DialogContent>
      <DialogActions>
        <Button
          variant="contained"
          onClick={() => setConfirmDialogOpen(false)}
          color="primary"
          sx={{ mx: 1 }}
        >
          {t("api.cancel")}
        </Button>
        <Button variant="contained" onClick={confirmDelete} color="error">
          {t("api.delete")}
        </Button>
      </DialogActions>
    </Dialog>
  );

  return { handleDelete, ConfirmDialog };
};

export default useDelete;
  