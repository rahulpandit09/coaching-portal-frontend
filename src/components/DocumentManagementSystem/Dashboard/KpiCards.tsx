import React, { useEffect, useState } from "react";
import { Inbox, ShieldCheck, Clock3, Archive } from "lucide-react";
import axiosInstance from "@/api/axiosInstance";
import type { Role } from "../types";

interface DashboardCounts {
  total_records: number;
  controlled: number;
  under_review: number;
  archive: number;
}

export function KpiCards({
  role,
  onTotalClick,
  onControlledClick,
  onReviewClick,
  onArchiveClick,
}: {
  role?: Role | string;
  onTotalClick?: () => void;
  onControlledClick?: () => void;
  onReviewClick?: () => void;
  onArchiveClick?: () => void;
}) {
  const [dashboardCounts, setDashboardCounts] =
    useState<DashboardCounts>({
      total_records: 0,
      controlled: 0,
      under_review: 0,
      archive: 0,
    });

  useEffect(() => {
    const fetchDashboardCounts = async () => {
      try {
        const response = await axiosInstance.get(
          "/dms-document/dashboard-cards"
        );

        const data = response?.data?.data;

        if (data) {
          setDashboardCounts({
            total_records: Number(data.total_records ?? 0),
            controlled: Number(data.controlled ?? 0),
            under_review: Number(data.under_review ?? 0),
            archive: Number(data.archive ?? 0),
          });
        }
      } catch (error) {
        console.error(
          "Failed to fetch DMS dashboard card metrics:",
          error
        );
      }
    };

    fetchDashboardCounts();
  }, []);

  const isUser = role === "User";

  return (
    <div
      className={`grid gap-3 mb-3.5 ${isUser
        ? "grid-cols-1 sm:grid-cols-3 lg:grid-cols-3"
        : "grid-cols-2 sm:grid-cols-2 lg:grid-cols-4"
        }`}
    >
      {/* Card 1: Total Records */}
      <div
        className="bg-white rounded-xl p-3.5 border border-gray-200 shadow-xs cursor-pointer"

      >
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">
            Total Records
          </span>

          <div className="size-8 rounded-lg bg-blue-50 text-[#1E6FBF] flex items-center justify-center">
            <Inbox className="h-5 w-5" />
          </div>
        </div>

        <div className="mt-2 flex items-baseline gap-1.5">
          <span className="text-2xl font-bold text-gray-900">
            {dashboardCounts.total_records}
          </span>

          <span className="text-[10px] text-gray-400">
            active
          </span>
        </div>
      </div>

      {/* Card 2: Controlled Docs */}
      <div
        className="bg-white rounded-xl p-3.5 border border-gray-200 shadow-xs cursor-pointer"

      >
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">
            Controlled
          </span>

          <div className="size-8 rounded-lg bg-emerald-50 text-[#22B843] flex items-center justify-center">
            <ShieldCheck className="h-5 w-5" />
          </div>
        </div>

        <div className="mt-2 flex items-baseline gap-1.5">
          <span className="text-2xl font-bold text-gray-900">
            {dashboardCounts.controlled}
          </span>

          <span className="text-[10px] text-gray-400">
            verified
          </span>
        </div>
      </div>

      {/* Card 3: Under Review */}
      <div
        className="bg-white rounded-xl p-3.5 border border-gray-200 shadow-xs cursor-pointer"

      >
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">
            Under Review
          </span>

          <div className="size-8 rounded-lg bg-amber-50 text-[#FABA17] flex items-center justify-center">
            <Clock3 className="h-5 w-5" />
          </div>
        </div>

        <div className="mt-2 flex items-baseline gap-1.5">
          <span className="text-2xl font-bold text-gray-900">
            {dashboardCounts.under_review}
          </span>

          <span className="text-[10px] text-gray-400">
            pending
          </span>
        </div>
      </div>

      {/* Card 4: Archive (Hidden for User role) */}
      {!isUser && (
        <div
          className="bg-white rounded-xl p-3.5 border border-gray-200 shadow-xs cursor-pointer"

        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">
              Archive
            </span>

            <div className="size-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <Archive className="h-5 w-5" />
            </div>
          </div>

          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-gray-900">
              {dashboardCounts.archive}
            </span>

            <span className="text-[10px] text-gray-400">
              historical
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
