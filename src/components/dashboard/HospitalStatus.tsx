
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

const hospitals = [
  {
    id: 1,
    name: "Muhimbili National Hospital",
    bedsAvailable: 12,
    totalBeds: 30,
    specialistAvailable: true,
    occupancy: 60
  },
  {
    id: 2,
    name: "Aga Khan Hospital",
    bedsAvailable: 5,
    totalBeds: 20,
    specialistAvailable: true,
    occupancy: 75
  },
  {
    id: 3,
    name: "Regency Medical Centre",
    bedsAvailable: 0,
    totalBeds: 15,
    specialistAvailable: false,
    occupancy: 100
  },
  {
    id: 4,
    name: "TMJ Hospital",
    bedsAvailable: 8,
    totalBeds: 12,
    specialistAvailable: false,
    occupancy: 33
  }
];

const getOccupancyColor = (occupancy: number) => {
  if (occupancy < 50) return 'text-green-600';
  if (occupancy < 80) return 'text-yellow-600';
  return 'text-emergency-600';
};

const getProgressColor = (occupancy: number) => {
  if (occupancy < 50) return 'bg-green-500';
  if (occupancy < 80) return 'bg-yellow-500';
  return 'bg-emergency-500';
};

const HospitalStatus = () => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-medium">Hospital Status</CardTitle>
        <Button variant="outline" size="sm">View All</Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {hospitals.map((hospital) => (
            <div key={hospital.id} className="space-y-2">
              <div className="flex justify-between items-center">
                <p className="font-medium text-sm">{hospital.name}</p>
                <span className={`text-xs font-medium ${getOccupancyColor(hospital.occupancy)}`}>
                  {hospital.bedsAvailable} beds available
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="flex-1">
                  <Progress 
                    value={hospital.occupancy} 
                    className={`h-2 ${getProgressColor(hospital.occupancy)}`}
                  />
                </div>
                <div className="text-xs text-gray-500">
                  {hospital.occupancy}% occupied
                </div>
              </div>
              <div className="flex">
                {hospital.specialistAvailable ? (
                  <span className="text-xs bg-green-100 text-green-800 rounded-full px-2 py-0.5">
                    Specialist on call
                  </span>
                ) : (
                  <span className="text-xs bg-gray-100 text-gray-600 rounded-full px-2 py-0.5">
                    No specialist available
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default HospitalStatus;
