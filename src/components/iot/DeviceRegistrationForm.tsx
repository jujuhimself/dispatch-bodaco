
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Loader2, Smartphone } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { addIoTDevice, IoTDevice } from '@/services/iot-service';

const formSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters long' }),
  device_id: z.string().min(2, { message: 'Device ID is required' }),
  type: z.string().min(1, { message: 'Device type is required' }),
  vehicle_id: z.string().optional(),
  owner_id: z.string().optional(),
  location_enabled: z.boolean().default(false),
  location_x: z.coerce.number().optional(),
  location_y: z.coerce.number().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const DeviceRegistrationForm: React.FC = () => {
  const queryClient = useQueryClient();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      device_id: '',
      type: '',
      vehicle_id: '',
      owner_id: '',
      location_enabled: false,
      location_x: 0,
      location_y: 0,
    },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (values: FormValues) => {
      const deviceData: Partial<IoTDevice> = {
        name: values.name,
        device_id: values.device_id,
        type: values.type,
        vehicle_id: values.vehicle_id || undefined,
        owner_id: values.owner_id || undefined,
      };

      if (values.location_enabled && values.location_x !== undefined && values.location_y !== undefined) {
        deviceData.location = {
          x: values.location_x,
          y: values.location_y,
        };
      }

      return addIoTDevice(deviceData);
    },
    onSuccess: () => {
      toast.success('Device registered successfully');
      form.reset();
      queryClient.invalidateQueries({ queryKey: ['iotDevices'] });
    },
    onError: (error) => {
      console.error('Failed to register device:', error);
      toast.error('Failed to register device');
    },
  });

  function onSubmit(values: FormValues) {
    mutate(values);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Smartphone className="mr-2 h-5 w-5" />
          Register New IoT Device
        </CardTitle>
        <CardDescription>
          Enter the details of the new IoT device to be registered in the system.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Device Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Medical Sensor" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="device_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Device ID</FormLabel>
                    <FormControl>
                      <Input placeholder="IOT-123456" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Device Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select device type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="sensor">Sensor</SelectItem>
                      <SelectItem value="tracker">Tracker</SelectItem>
                      <SelectItem value="medical">Medical Device</SelectItem>
                      <SelectItem value="camera">Camera</SelectItem>
                      <SelectItem value="alarm">Alarm</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="vehicle_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vehicle ID (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="VEH-789012" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="owner_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Owner ID (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Owner identifier" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="location_enabled"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Initial Location</FormLabel>
                    <FormDescription>
                      Set the initial GPS coordinates for this device
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
            
            {form.watch('location_enabled') && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="location_x"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Longitude</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.000001" placeholder="0.000000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="location_y"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Latitude</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.000001" placeholder="0.000000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}
            
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Registering...
                </>
              ) : (
                'Register Device'
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default DeviceRegistrationForm;
