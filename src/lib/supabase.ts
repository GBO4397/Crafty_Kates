import { createClient } from '@supabase/supabase-js';


// Initialize database client
const supabaseUrl = 'https://gufmfkkdqgjomuitbgtt.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd1Zm1ma2tkcWdqb211aXRiZ3R0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUwODU1ODksImV4cCI6MjA5MDY2MTU4OX0.zDSmO1TlrJtwPnM2Peivprubq0HgGhrnJCGIGs_6Nv8';
const supabase = createClient(supabaseUrl, supabaseKey);


export { supabase };