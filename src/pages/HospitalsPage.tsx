
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Hospital } from '@/types/emergency-types';
import { fetchHospitals, updateHospitalCapacity } from '@/services/emergency-service';
import { useQuery } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { AlertCircle, Hospital as HospitalIcon, Loader2, PlusCircle, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

const HospitalsPage: React.FC = () => {
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [newBeds, setNewBeds] = useState<string>('');
  const [showAddHospital, setShowAddHospital] = useState(false);
  const [newHospital, setNewHospital] = useState({
    name: '',
    location: '',
    total_beds: '',
    available_beds: ''
  });

  const {
    data: hospitals = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['hospitals'],
    queryFn: fetchHospitals,
    refetchInterval: 60000 // Refetch every minute
  });

  const handleUpdateBeds = async () => {
    if (!selectedHospital) return;
    
    const bedsValue = parseInt(newBeds, 10);
    
    if (isNaN(bedsValue) || bedsValue < 0 || bedsValue > selectedHospital.total_beds) {
      toast.error('Please enter a valid number of available beds');
      return;
    }
    
    try {
      await updateHospitalCapacity(selectedHospital.id, bedsValue);
      toast.success(`Updated ${selectedHospital.name} available beds to ${bedsValue}`);
      setIsUpdateDialogOpen(false);
      refetch();
    } catch (error) {
      toast.error('Failed to update hospital capacity');
      console.error('Error updating hospital capacity:', error);
    }
  };

  const openUpdateDialog = (hospital: Hospital) => {
    setSelectedHospital(hospital);
    setNewBeds(hospital.available_beds.toString());
    setIsUpdateDialogOpen(true);
  };

  const calculateOccupancy = (hospital: Hospital) => {
    return Math.round(((hospital.total_beds - hospital.available_beds) / hospital.total_beds) * 100);
  };

  const getOccupancyColor = (occupancy: number) => {
    if (occupancy < 50) return 'bg-green-500';
    if (occupancy < 80) return 'bg-yellow-500';
    return 'bg-emergency-500';
  };
  
  const getOccupancyTextColor = (occupancy: number) => {
    if (occupancy < 50) return 'text-green-600';
    if (occupancy < 80) return 'text-yellow-600';
    return 'text-emergency-600';
  };

  const handleRefresh = () => {
    refetch();
    toast.success("Hospital data refreshed");
  };

  const handleAddHospital = () => {
    // This would connect to a service to add a new hospital
    // For now we'll just show a success and close the dialog
    toast.success(`Added new hospital: ${newHospital.name}`);
    setShowAddHospital(false);
    setNewHospital({
      name: '',
      location: '',
      total_beds: '',
      available_beds: ''
    });
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Hospital Management</h1>
        
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          
          <Button
            size="sm"
            onClick={() => setShowAddHospital(true)}
            className="bg-emergency-600 hover:bg-emergency-700 text-white"
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            Add Hospital
          </Button>
        </div>
      </div>

      <Tabs defaultValue="list">
        <TabsList>
          <TabsTrigger value="list">Hospital List</TabsTrigger>
          <TabsTrigger value="capacity">Capacity Overview</TabsTrigger>
        </TabsList>
        
        <TabsContent value="list" className="space-y-4 mt-4">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-emergency-500" />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-64">
              <AlertCircle className="h-10 w-10 text-emergency-500 mb-2" />
              <h3 className="text-lg font-medium">Error loading hospitals</h3>
              <p className="text-sm text-gray-500 mb-4">Failed to fetch hospital data</p>
              <Button onClick={() => refetch()}>Try Again</Button>
            </div>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Hospitals</CardTitle>
                <CardDescription>Manage hospital information and bed availability</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Total Beds</TableHead>
                      <TableHead>Available Beds</TableHead>
                      <TableHead>Occupancy</TableHead>
                      <TableHead>Specialist Available</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {hospitals.map((hospital) => {
                      const occupancy = calculateOccupancy(hospital);
                      return (
                        <TableRow key={hospital.id}>
                          <TableCell className="font-medium">{hospital.name}</TableCell>
                          <TableCell>{hospital.location}</TableCell>
                          <TableCell>{hospital.total_beds}</TableCell>
                          <TableCell>{hospital.available_beds}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Progress 
                                value={occupancy} 
                                className={`h-2 w-24 ${getOccupancyColor(occupancy)}`} 
                              />
                              <span className={`text-xs ${getOccupancyTextColor(occupancy)}`}>
                                {occupancy}%
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {hospital.specialist_available ? (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Available
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                Not Available
                              </span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => openUpdateDialog(hospital)}
                            >
                              Update Beds
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="capacity" className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {isLoading ? (
            <div className="flex justify-center items-center h-64 col-span-full">
              <Loader2 className="h-8 w-8 animate-spin text-emergency-500" />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-64 col-span-full">
              <AlertCircle className="h-10 w-10 text-emergency-500 mb-2" />
              <h3 className="text-lg font-medium">Error loading hospital capacity</h3>
              <Button onClick={() => refetch()}>Try Again</Button>
            </div>
          ) : (
            hospitals.map(hospital => {
              const occupancy = calculateOccupancy(hospital);
              return (
                <Card key={hospital.id} className="transition-all hover:shadow-md">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{hospital.name}</CardTitle>
                      <HospitalIcon className="h-5 w-5 text-emergency-600" />
                    </div>
                    <CardDescription>{hospital.location}</CardDescription>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Occupancy</span>
                          <span className={getOccupancyTextColor(occupancy)}>{occupancy}%</span>
                        </div>
                        <Progress 
                          value={occupancy} 
                          className={`h-2 ${getOccupancyColor(occupancy)}`} 
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Total Beds</p>
                          <p className="font-semibold">{hospital.total_beds}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Available Beds</p>
                          <p className="font-semibold">{hospital.available_beds}</p>
                        </div>
                      </div>
                      
                      {hospital.specialist_available && (
                        <div className="flex">
                          <span className="text-xs bg-green-100 text-green-800 rounded-full px-2 py-1">
                            Specialist on call
                          </span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => openUpdateDialog(hospital)}
                    >
                      Update Availability
                    </Button>
                  </CardFooter>
                </Card>
              );
            })
          )}
        </TabsContent>
      </Tabs>
      
      {/* Update Beds Dialog */}
      <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Hospital Capacity</DialogTitle>
            <DialogDescription>
              Update the number of available beds for {selectedHospital?.name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Total beds: {selectedHospital?.total_beds}</span>
                <span>Currently available: {selectedHospital?.available_beds}</span>
              </div>
              
              <Separator />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="available-beds">Available Beds</Label>
              <Input 
                id="available-beds" 
                type="number"
                value={newBeds}
                onChange={(e) => setNewBeds(e.target.value)}
                min={0}
                max={selectedHospital?.total_beds || 0}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUpdateDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleUpdateBeds}>Update</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Add Hospital Dialog */}
      <Dialog open={showAddHospital} onOpenChange={setShowAddHospital}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Hospital</DialogTitle>
            <DialogDescription>
              Enter the details for the new hospital
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="hospital-name">Hospital Name</Label>
              <Input 
                id="hospital-name" 
                value={newHospital.name}
                onChange={(e) => setNewHospital({...newHospital, name: e.target.value})}
                placeholder="City General Hospital"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="hospital-location">Location</Label>
              <Input 
                id="hospital-location" 
                value={newHospital.location}
                onChange={(e) => setNewHospital({...newHospital, location: e.target.value})}
                placeholder="123 Medical Drive, City"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="total-beds">Total Beds</Label>
                <Input 
                  id="total-beds" 
                  type="number"
                  value={newHospital.total_beds}
                  onChange={(e) => setNewHospital({...newHospital, total_beds: e.target.value})}
                  placeholder="100"
                  min={1}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="available-beds">Available Beds</Label>
                <Input 
                  id="available-beds" 
                  type="number"
                  value={newHospital.available_beds}
                  onChange={(e) => setNewHospital({...newHospital, available_beds: e.target.value})}
                  placeholder="75"
                  min={0}
                  max={newHospital.total_beds ? parseInt(newHospital.total_beds) : 100}
                />
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddHospital(false)}>Cancel</Button>
            <Button onClick={handleAddHospital}>Add Hospital</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HospitalsPage;
