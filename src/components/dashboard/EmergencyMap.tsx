
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const EmergencyMap = () => {
  return (
    <Card className="col-span-1 lg:col-span-2 h-[400px]">
      <CardHeader>
        <CardTitle className="text-lg font-medium">Live Emergency Map</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="w-full h-[330px] bg-gray-100 rounded-md flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-500 mb-2">Map integration requires API key setup</p>
            <div className="inline-flex items-center justify-center rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800">
              Google Maps or Mapbox
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EmergencyMap;
