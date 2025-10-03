-- Add foreign key relationship between devices.owner_id and profiles.id
ALTER TABLE public.devices 
DROP CONSTRAINT IF EXISTS devices_owner_id_fkey;

ALTER TABLE public.devices 
ADD CONSTRAINT devices_owner_id_fkey 
FOREIGN KEY (owner_id) 
REFERENCES public.profiles(id) 
ON DELETE SET NULL;