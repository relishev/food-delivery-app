import type { CollectionConfig } from "payload";

import { admins } from "../utils/access/admins";
import { checkRole } from "../utils/access/checkRole";
import { joinApplicationEmail } from "@/app/email/templates";

const FeedbackAndCooperations: CollectionConfig = {
  hooks: {
    afterChange: [
      async ({ doc, operation, req }) => {
        if (operation !== "create" || doc.type !== "cooperation") return;
        const notifyEmail = process.env.ADMIN_NOTIFY_EMAIL;
        if (!notifyEmail) return;
        try {
          const tpl = joinApplicationEmail({
            name:        doc.name        ?? "",
            phone:       doc.phoneNumber ?? "",
            description: doc.description ?? "",
          });
          await req.payload.sendEmail({
            to:      notifyEmail,
            subject: tpl.subject,
            html:    tpl.html,
            text:    tpl.text,
          });
        } catch (err) {
          req.payload.logger.error({ err }, "Failed to send join application email");
        }
      },
    ],
  },
  access: {
    create: ({ req }) => {
      if (checkRole(["guest"], req.user)) {
        return false;
      }
      return true;
    },
    delete: admins,
    read: ({ req }) => {
      if (checkRole(["admin", "guest"], req.user)) {
        return true;
      }
      return false;
    },
    update: admins,
  },

  admin: {
    defaultColumns: ["name", "phoneNumber", "type"],
    useAsTitle: "type",
  },

  fields: [
    {
      name: "name",
      type: "text",
      label: "Name",
      required: false,
    },
    {
      name: "phoneNumber",
      type: "text",
      label: "Phone number",
      required: false,
    },
    {
      name: "description",
      type: "textarea",
      label: "Description",
      required: true,
    },
    {
      name: "type",
      type: "select",
      required: true,
      options: [
        {
          label: "Cooperation",
          value: "cooperation",
        },
        {
          label: "Feedback",
          value: "feedback",
        },
      ],
    },
  ],
  labels: { plural: "Feedback and suggestions", singular: "Feedback and suggestions" },
  slug: "FeedbackAndCooperations",
  timestamps: true,
};

export default FeedbackAndCooperations;
