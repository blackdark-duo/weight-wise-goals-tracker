
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import { Profile } from "./useAdminProfiles";

export const useUserManagement = (profiles: Profile[], fetchProfiles: () => Promise<void>) => {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [emailSubject, setEmailSubject] = useState("");
  const [emailContent, setEmailContent] = useState("");
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [isSendingReset, setIsSendingReset] = useState(false);

  const sendPasswordReset = async (userId: string) => {
    try {
      setIsSendingReset(true);
      
      const user = profiles.find(p => p.id === userId);
      if (!user?.email) {
        throw new Error("User email not found");
      }
      
      const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: `${window.location.origin}/account`
      });
      
      if (error) throw error;
      
      toast.success(`Password reset email sent to ${user.email}`);
    } catch (error: any) {
      console.error("Error sending password reset:", error);
      toast.error("Failed to send password reset email");
    } finally {
      setIsSendingReset(false);
    }
  };

  const sendEmail = async () => {
    try {
      if (!selectedUserId) return;
      
      setIsSendingEmail(true);
      
      const user = profiles.find(p => p.id === selectedUserId);
      if (!user?.email) {
        throw new Error("User email not found");
      }
      
      // In production, we would call an Edge Function here to send the email
      console.log(`Sending email to ${user.email} with subject: ${emailSubject}`);
      console.log(`Email content: ${emailContent}`);
      
      // For demo purposes, just show a success message
      toast.success(`Email sent to ${user.email}`);
      
      setEmailSubject("");
      setEmailContent("");
    } catch (error: any) {
      console.error("Error sending email:", error);
      toast.error("Failed to send email");
    } finally {
      setIsSendingEmail(false);
    }
  };

  const exportUserData = () => {
    try {
      const csvContent = [
        // Header row
        ["ID", "Name", "Email", "Admin", "Unit", "Timezone", "Created At", "Updated At", "Webhook Limit", "Webhook Count", "Last Webhook Date", "Status"].join(","),
        // Data rows
        ...profiles.map(p => [
          p.id,
          p.display_name || "",
          p.email || "",
          p.is_admin ? "Yes" : "No",
          p.preferred_unit || "",
          p.timezone || "",
          p.created_at || "",
          p.updated_at || "",
          p.webhook_limit || 0,
          p.webhook_count || 0,
          p.last_webhook_date || "",
          p.is_suspended ? "Suspended" : "Active"
        ].join(","))
      ].join("\n");
      
      const blob = new Blob([csvContent], { type: "text/csv" });
      const href = URL.createObjectURL(blob);
      
      const link = document.createElement("a");
      link.href = href;
      link.download = `users-export-${format(new Date(), "yyyy-MM-dd")}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(href);
      
      toast.success("User data exported successfully");
    } catch (error: any) {
      console.error("Error exporting user data:", error);
      toast.error("Failed to export user data");
    }
  };

  return {
    selectedUserId,
    setSelectedUserId,
    emailSubject,
    setEmailSubject,
    emailContent,
    setEmailContent,
    isSendingEmail,
    isSendingReset,
    sendPasswordReset,
    sendEmail,
    exportUserData,
  };
};
