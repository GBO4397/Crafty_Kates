import { createClient } from '@supabase/supabase-js';


// Initialize database client
const supabaseUrl = 'https://csdwcjbfexwtaqpmzzkj.databasepad.com';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IjhmNzFmNzlhLWZkMjAtNDYyNy1hMzVmLTExZTc5NjhlY2QwYSJ9.eyJwcm9qZWN0SWQiOiJjc2R3Y2piZmV4d3RhcXBtenpraiIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzcxNTEwODE0LCJleHAiOjIwODY4NzA4MTQsImlzcyI6ImZhbW91cy5kYXRhYmFzZXBhZCIsImF1ZCI6ImZhbW91cy5jbGllbnRzIn0.7PlmeZjxGTplqF0juXTQ_9vJcleqkcSL6_D3fGm0WIg';
const supabase = createClient(supabaseUrl, supabaseKey);


export { supabase };