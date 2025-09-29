import React from "react";
import { User } from "../types/user";

interface UserCardProps {
  user: User;
}

const UserCard: React.FC<UserCardProps> = ({ user }) => {
  return (
    <div className="bg-primary p-4 rounded-lg shadow-md border border-gray-200 flex justify-between items-center">
      <div>
        <h3 className="text-lg font-semibold text-gray-800">{user.email}</h3>
        <p className="text-gray-600">{user.role}</p>
      </div>
    </div>
  );
};

export default UserCard;
