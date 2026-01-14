-- Insert corresponding milestones
INSERT INTO public.cure_milestones (therapy_id, title, description, target_date, completed_date, status) VALUES
-- Teplizumab milestones (completed therapy)
((SELECT id FROM public.cure_therapies WHERE name = 'Teplizumab (Tzield)'), 'Phase III Completion', 'Complete final phase III trials', '2021-06-30', '2021-06-30', 'Completed'),
((SELECT id FROM public.cure_therapies WHERE name = 'Teplizumab (Tzield)'), 'FDA Approval', 'Receive FDA approval for T1D delay indication', '2022-11-17', '2022-11-17', 'Completed'),

-- ATG-GCSF Cell Therapy milestones
((SELECT id FROM public.cure_therapies WHERE name = 'ATG-GCSF Cell Therapy'), 'Patient Enrollment Complete', 'Enroll 100 participants in Phase II trial', '2024-06-30', '2024-06-15', 'Completed'),
((SELECT id FROM public.cure_therapies WHERE name = 'ATG-GCSF Cell Therapy'), '6-Month Safety Data', 'Complete 6-month safety analysis', '2024-12-15', NULL, 'In Progress'),
((SELECT id FROM public.cure_therapies WHERE name = 'ATG-GCSF Cell Therapy'), 'Phase II Results', 'Publish complete Phase II efficacy data', '2025-03-15', NULL, 'Pending'),

-- Stem Cell-Derived Beta Cells milestones
((SELECT id FROM public.cure_therapies WHERE name = 'Stem Cell-Derived Beta Cells'), 'First Patient Dosed', 'Begin dosing in Phase I/II trial', '2023-10-01', '2023-09-28', 'Completed'),
((SELECT id FROM public.cure_therapies WHERE name = 'Stem Cell-Derived Beta Cells'), 'Safety Run-in Complete', 'Complete initial safety cohort', '2024-08-15', NULL, 'In Progress'),
((SELECT id FROM public.cure_therapies WHERE name = 'Stem Cell-Derived Beta Cells'), 'Efficacy Readout', 'Report initial efficacy data', '2025-04-30', NULL, 'Pending'),

-- Smart Insulin Patches milestones
((SELECT id FROM public.cure_therapies WHERE name = 'Smart Insulin Patches'), 'Animal Studies Complete', 'Complete preclinical efficacy studies', '2024-03-31', '2024-03-20', 'Completed'),
((SELECT id FROM public.cure_therapies WHERE name = 'Smart Insulin Patches'), 'IND Filing', 'Submit Investigational New Drug application', '2024-09-30', NULL, 'In Progress'),
((SELECT id FROM public.cure_therapies WHERE name = 'Smart Insulin Patches'), 'First-in-Human Study', 'Begin Phase I clinical trial', '2025-06-01', NULL, 'Pending'),

-- Artificial Pancreas 2.0 milestones
((SELECT id FROM public.cure_therapies WHERE name = 'Artificial Pancreas 2.0'), 'Pivotal Trial Enrollment', 'Complete enrollment in pivotal trial', '2024-02-28', '2024-02-15', 'Completed'),
((SELECT id FROM public.cure_therapies WHERE name = 'Artificial Pancreas 2.0'), 'Primary Endpoint Analysis', 'Complete primary endpoint analysis', '2024-08-31', NULL, 'In Progress'),
((SELECT id FROM public.cure_therapies WHERE name = 'Artificial Pancreas 2.0'), 'FDA Submission', 'Submit for FDA approval', '2024-12-15', NULL, 'Pending'),

-- Gene Therapy GT-002 milestones
((SELECT id FROM public.cure_therapies WHERE name = 'Gene Therapy GT-002'), 'Manufacturing Scale-up', 'Complete manufacturing process development', '2024-06-30', NULL, 'In Progress'),
((SELECT id FROM public.cure_therapies WHERE name = 'Gene Therapy GT-002'), 'IND Approval', 'Receive IND approval for Phase I', '2024-12-31', NULL, 'Pending'),
((SELECT id FROM public.cure_therapies WHERE name = 'Gene Therapy GT-002'), 'First Patient Treated', 'Treat first patient in Phase I', '2025-03-31', NULL, 'Pending');