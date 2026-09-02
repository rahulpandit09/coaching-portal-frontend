import React from "react";
import {
  Users,
  GraduationCap,
  UserRoundCheck,
  UserRound,
} from "lucide-react";
import { IUserStats } from "@/utils/user.types";

interface UserDashboardProps {
  stats: IUserStats;
}

const UserDashboard: React.FC<UserDashboardProps> = ({ stats }) => {
  const dashboardCards = [
    {
      title: "Total Users",
      value: stats.totalUsers,
      icon: Users,
    },
    {
      title: "Students",
      value: stats.students,
      icon: GraduationCap,
    },
    {
      title: "Teachers",
      value: stats.teachers,
      icon: UserRoundCheck,
    },
    {
      title: "Parents",
      value: stats.parents,
      icon: UserRound,
    },
  ];

  return (
    <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {dashboardCards.map((card) => {
        const Icon = card.icon;

        return (
          <div
            key={card.title}
            className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  {card.title}
                </p>

                <h2 className="mt-2 text-2xl font-bold text-gray-800">
                  {card.value}
                </h2>
              </div>

              <div className="rounded-lg bg-blue-50 p-3">
                <Icon className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default UserDashboard;