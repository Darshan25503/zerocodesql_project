'use client';
import { useState } from "react";
import UserUpdateForm from "../UserManageComponents/UserUpdateForm";
import DataSourceContent from "./DataSourceContent";
import { AsyncReturnType } from "@/lib/database/types";
import { User } from "@/lib/manage/user";

interface SettingsContentProps {
  username: string;
  email: string;
  schema: AsyncReturnType<typeof User.getAccessibleEntities>,
  isSuperAdmin: boolean;
}

const SettingContent = ({ username, email, schema, isSuperAdmin }: SettingsContentProps) => {
  const [activeSection, setActiveSection] = useState("Profile");

  const renderActivation = () => {
    switch (activeSection) {
      case "Profile":
        return (
          <div className="p-5">
            <h2 className="text-xl font-bold">Profile Settings</h2>
            <h4 className="text-justify my-4 text-sm">In this section, you can update your account password quickly and securely. 
              Simply enter your new password and confirm it. Ensure that your new password is strong, using a combination of uppercase and lowercase 
              letters, numbers, and special characters to enhance security. Once confirmed, your password will be updated, 
              and you can use the new password the next time you log in.</h4>
            <UserUpdateForm Username={username} Email={email} />
          </div>
        );
      case "DataSource":
        return (
          <div className="p-5">
            <h2 className="text-xl font-bold">Data Source Settings</h2>
            <h4 className="text-justify my-4 text-sm">In this section, you can manage your connected data sources with ease. 
              You have the option to delete any connected data source that you no longer need. 
              Additionally, you can edit the name of each data source to keep your setup organized 
              and easily identifiable. These changes help you maintain control over the data sources linked to your account, 
              ensuring they are up-to-date and relevant to your needs.</h4>
            <DataSourceContent schema={schema} />
          </div>
        );
      default:
        null
    }
  };

  return (
    <>
      <ul className="menu border-r-2 bg-slate-200 gap-2 w-80">
        <li>
          <a
            className={activeSection === "Profile" ? "active" : ""}
            onClick={() => setActiveSection("Profile")}
          >
            Profile
          </a>
        </li>
        {isSuperAdmin &&
          <li>
            <a
              className={activeSection === "DataSource" ? "active" : ""}
              onClick={() => setActiveSection("DataSource")}
            >
              Data Sources
            </a>
          </li>
        }
      </ul>
      <div className="p-2 h-full w-full">
        {renderActivation()}
      </div>
    </>
  );
};

export default SettingContent;