"use client";

import React from 'react';
import { Button } from "@/components/ui/button";
import { CardHeader, CardTitle } from "@/components/ui/card"; // Keep CardHeader/Title if used for structure
import { ChevronLeft, ChevronRight } from "lucide-react";
import { format } from 'date-fns';
import { COLORS } from "@/lib/constants";

interface DayViewNavProps {
    selectedDate: Date;
    onPreviousDay: () => void;
    onNextDay: () => void;
    onToday: () => void;
    title?: string;
}

const DayViewNav: React.FC<DayViewNavProps> = ({
    selectedDate,
    onPreviousDay,
    onNextDay,
    onToday,
    title = "Day Schedule", // Default or pass specific title
}) => {
    return (
        <>
            {/* Optional Header like SchedulerChart */}
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg md:text-xl font-bold text-foreground">
                    {title}
                </CardTitle>
                <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" onClick={onPreviousDay}>
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={onToday}>
                        Today
                    </Button>
                    <Button variant="outline" size="sm" onClick={onNextDay}>
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </CardHeader>

            {/* Date display and legend */}
            <div className="px-4 pt-2 pb-4 space-y-3">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
                    {/* Date navigation embedded (alternative style) */}
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={onPreviousDay}
                            className="bg-gray-200 hover:bg-gray-300 text-gray-700 p-2 rounded"
                            aria-label="Previous Day"
                        >
                            <ChevronLeft className="h-5 w-5" />
                        </button>
                        <h3 className="text-center font-medium py-2 text-lg">
                            {format(selectedDate, "EEEE, MMMM d, yyyy")}
                        </h3>
                        <button
                            onClick={onNextDay}
                            className="bg-gray-200 hover:bg-gray-300 text-gray-700 p-2 rounded"
                            aria-label="Next Day"
                        >
                            <ChevronRight className="h-5 w-5" />
                        </button>
                    </div>
                    {/* Legend */}
                    <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                        <div className="flex items-center space-x-1">
                            <div className={`w-3 h-3 rounded-sm ${COLORS.AVAILABLE.BG}`}></div>
                            <span className="text-xs">{COLORS.AVAILABLE.LABEL}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                            <div className={`w-3 h-3 rounded-sm ${COLORS.BOOKED.BG}`}></div>
                            <span className="text-xs">{COLORS.BOOKED.LABEL}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                            <div className={`w-3 h-3 rounded-sm ${COLORS.BLOCKED.BG}`}></div>
                            <span className="text-xs">{COLORS.BLOCKED.LABEL}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                            <div className={`w-3 h-3 rounded-sm ${COLORS.CLINIC.BG}`}></div>
                            <span className="text-xs">{COLORS.CLINIC.LABEL}</span>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default DayViewNav; 