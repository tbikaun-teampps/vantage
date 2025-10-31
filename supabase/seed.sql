SET session_replication_role = replica;

--
-- PostgreSQL database dump
--

-- \restrict aZmQy3KEQ2c0j3N9s1bDunffc4utd5a7FxYzgYuwu7A5nV2JAGiYyYqhnakGcVN

-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.6

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: audit_log_entries; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."audit_log_entries" ("instance_id", "id", "payload", "created_at", "ip_address") VALUES
	('00000000-0000-0000-0000-000000000000', '82508152-7ff2-4d73-a3ab-b2beb0c526c4', '{"action":"login","actor_id":"00000000-0000-0000-0000-000000000001","actor_username":"tbikaun+vantage_local@teampps.com.au","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-10-31 08:08:55.11832+00', ''),
	('00000000-0000-0000-0000-000000000000', '36031675-0392-4762-8253-359cb3f19e12', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"tbikaun+jd@teampps.com.au","user_id":"d5f1252a-9d56-47f8-98cf-f6f34914bb6c","user_phone":""}}', '2025-10-31 08:11:45.234487+00', '');


--
-- Data for Name: flow_state; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: users; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."users" ("instance_id", "id", "aud", "role", "email", "encrypted_password", "email_confirmed_at", "invited_at", "confirmation_token", "confirmation_sent_at", "recovery_token", "recovery_sent_at", "email_change_token_new", "email_change", "email_change_sent_at", "last_sign_in_at", "raw_app_meta_data", "raw_user_meta_data", "is_super_admin", "created_at", "updated_at", "phone", "phone_confirmed_at", "phone_change", "phone_change_token", "phone_change_sent_at", "email_change_token_current", "email_change_confirm_status", "banned_until", "reauthentication_token", "reauthentication_sent_at", "is_sso_user", "deleted_at", "is_anonymous") VALUES
	('00000000-0000-0000-0000-000000000000', 'd34835f8-a043-42f9-a376-6aac23cb76ce', 'authenticated', 'authenticated', 'tbikaun+planner@teampps.com.au', '$2a$10$qKAMVjOmXjWurTaTbNa5bOPCOhDm7tFLbSyBdcyf7d1GSv.FS1RzC', '2025-10-31 05:32:42.614454+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"account_type": "interviewee", "email_verified": true}', NULL, '2025-10-31 05:32:42.598491+00', '2025-10-31 05:32:42.616483+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000001', 'authenticated', 'authenticated', 'tbikaun+vantage_local@teampps.com.au', '$2a$10$UkCKciSi7RIOxC2fjk3psOMp0wgMGWsJHJOgZGZBGlWNe69rDSQui', '2025-10-31 02:21:44.433362+00', NULL, '', NULL, '', NULL, '', '', NULL, '2025-10-31 08:08:55.121541+00', '{"provider": "email", "providers": ["email"]}', '{"email_verified": true}', NULL, '2025-10-31 02:21:44.423295+00', '2025-10-31 08:08:55.128733+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', 'd5f1252a-9d56-47f8-98cf-f6f34914bb6c', 'authenticated', 'authenticated', 'tbikaun+jd@teampps.com.au', '$2a$10$kUkKev8JHqNQSCM4bLNYheDazSYTewYEO8BNbEwAkwypht0Fe4JOq', '2025-10-31 08:11:45.238948+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"account_type": "interviewee", "email_verified": true}', NULL, '2025-10-31 08:11:45.222337+00', '2025-10-31 08:11:45.240872+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false);


--
-- Data for Name: identities; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."identities" ("provider_id", "user_id", "identity_data", "provider", "last_sign_in_at", "created_at", "updated_at", "id") VALUES
	('d5f1252a-9d56-47f8-98cf-f6f34914bb6c', 'd5f1252a-9d56-47f8-98cf-f6f34914bb6c', '{"sub": "d5f1252a-9d56-47f8-98cf-f6f34914bb6c", "email": "tbikaun+jd@teampps.com.au", "email_verified": false, "phone_verified": false}', 'email', '2025-10-31 08:11:45.23159+00', '2025-10-31 08:11:45.231662+00', '2025-10-31 08:11:45.231662+00', 'e399a3b9-be76-4fb2-a19c-edad01e2adf7');


--
-- Data for Name: instances; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: oauth_clients; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: sessions; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."sessions" ("id", "user_id", "created_at", "updated_at", "factor_id", "aal", "not_after", "refreshed_at", "user_agent", "ip", "tag", "oauth_client_id") VALUES
	('ae8881f8-6118-4750-bb2a-2c5d2972a5d8', '00000000-0000-0000-0000-000000000001', '2025-10-31 08:08:55.12173+00', '2025-10-31 08:08:55.12173+00', NULL, 'aal1', NULL, NULL, 'node', '172.19.0.1', NULL, NULL);


--
-- Data for Name: mfa_amr_claims; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."mfa_amr_claims" ("session_id", "created_at", "updated_at", "authentication_method", "id") VALUES
	('ae8881f8-6118-4750-bb2a-2c5d2972a5d8', '2025-10-31 08:08:55.130392+00', '2025-10-31 08:08:55.130392+00', 'password', '0d9660cb-0845-4ecb-a3af-d56e0d871f44');


--
-- Data for Name: mfa_factors; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: mfa_challenges; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: oauth_authorizations; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: oauth_consents; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: one_time_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."refresh_tokens" ("instance_id", "id", "token", "user_id", "revoked", "created_at", "updated_at", "parent", "session_id") VALUES
	('00000000-0000-0000-0000-000000000000', 1, '35ich22mu26o', '00000000-0000-0000-0000-000000000001', false, '2025-10-31 08:08:55.125155+00', '2025-10-31 08:08:55.125155+00', NULL, 'ae8881f8-6118-4750-bb2a-2c5d2972a5d8');


--
-- Data for Name: sso_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: saml_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: saml_relay_states; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: sso_domains; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: profiles; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."profiles" ("id", "email", "full_name", "created_at", "updated_at", "is_admin", "is_internal", "subscription_tier", "subscription_features", "onboarded", "onboarded_at") VALUES
	('00000000-0000-0000-0000-000000000001', 'tbikaun+vantage_local@teampps.com.au', 'Tyler Bikaun (Test User)', '2025-10-31 05:31:32.471122+00', '2025-10-31 05:31:32.471122+00', true, false, 'consultant', '{"maxCompanies": 999}', true, '2025-10-31 05:31:32.471122+00'),
	('d34835f8-a043-42f9-a376-6aac23cb76ce', 'tbikaun+planner@teampps.com.au', NULL, '2025-10-31 05:32:42.597783+00', '2025-10-31 05:32:42.597783+00', false, false, 'interviewee', '{"maxCompanies": 1}', false, NULL),
	('d5f1252a-9d56-47f8-98cf-f6f34914bb6c', 'tbikaun+jd@teampps.com.au', NULL, '2025-10-31 08:11:45.221623+00', '2025-10-31 08:11:45.221623+00', false, false, 'interviewee', '{"maxCompanies": 1}', false, NULL);


--
-- Data for Name: companies; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."companies" ("id", "created_at", "updated_at", "name", "created_by", "code", "description", "icon_url", "is_deleted", "deleted_at", "is_demo", "branding") VALUES
	('b64d182f-0ee3-40a0-b367-281f31902620', '2025-10-31 02:38:13.143181+00', '2025-10-31 02:38:13.143181+00', 'Ore Inc', '00000000-0000-0000-0000-000000000001', 'ORE', 'Global gold mining company with operations across Australia and Africa', NULL, false, NULL, false, NULL);


--
-- Data for Name: business_units; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."business_units" ("id", "created_at", "updated_at", "created_by", "name", "code", "description", "company_id", "is_deleted", "deleted_at") VALUES
	(1, '2025-10-31 02:51:54.960718+00', '2025-10-31 02:51:54.960718+00', '00000000-0000-0000-0000-000000000001', 'APAC Operations', 'ORE-APAC', 'Manages all Australian mining operations and exploration activities', 'b64d182f-0ee3-40a0-b367-281f31902620', false, NULL),
	(2, '2025-10-31 02:51:56.780398+00', '2025-10-31 02:51:56.780398+00', '00000000-0000-0000-0000-000000000001', 'Africa Operations', 'ORE-AFR', 'Oversees all African mining operations and development projects', 'b64d182f-0ee3-40a0-b367-281f31902620', false, NULL);


--
-- Data for Name: regions; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."regions" ("id", "created_at", "updated_at", "created_by", "business_unit_id", "name", "description", "code", "company_id", "is_deleted", "deleted_at") VALUES
	(1, '2025-10-31 02:52:21.547888+00', '2025-10-31 02:52:21.547888+00', '00000000-0000-0000-0000-000000000001', 1, 'Queensland', 'Northern Queensland operations including underground and open-pit mines', 'APAC-QLD', 'b64d182f-0ee3-40a0-b367-281f31902620', false, NULL),
	(2, '2025-10-31 02:52:22.930567+00', '2025-10-31 02:52:22.930567+00', '00000000-0000-0000-0000-000000000001', 1, 'Western Australia', 'Goldfields and Pilbara operations', 'APAC-WA', 'b64d182f-0ee3-40a0-b367-281f31902620', false, NULL),
	(4, '2025-10-31 02:52:25.537165+00', '2025-10-31 02:52:25.537165+00', '00000000-0000-0000-0000-000000000001', 2, 'West Africa', 'Operations in Ghana and Mali', 'AFR-WEST', 'b64d182f-0ee3-40a0-b367-281f31902620', false, NULL),
	(5, '2025-10-31 02:58:48.551792+00', '2025-10-31 02:58:48.551792+00', '00000000-0000-0000-0000-000000000001', 2, 'South Africa', 'Operations in South Africa and Tanzania', 'AFR-SOUTH', 'b64d182f-0ee3-40a0-b367-281f31902620', false, NULL);


--
-- Data for Name: sites; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."sites" ("id", "created_at", "updated_at", "created_by", "name", "description", "code", "region_id", "lat", "lng", "company_id", "is_deleted", "deleted_at") VALUES
	(1, '2025-10-31 02:53:11.565464+00', '2025-10-31 02:53:11.565464+00', '00000000-0000-0000-0000-000000000001', 'Kangaroo Creek Mine', 'Underground gold mine, 450m depth, 2.5Mtpa capacity', 'QLD-KCM', 1, NULL, NULL, 'b64d182f-0ee3-40a0-b367-281f31902620', false, NULL),
	(2, '2025-10-31 02:53:15.857757+00', '2025-10-31 02:53:15.857757+00', '00000000-0000-0000-0000-000000000001', 'Red Desert Mine', 'Open-pit operation, heap leach processing, 5Mtpa', 'WA-RDM', 2, NULL, NULL, 'b64d182f-0ee3-40a0-b367-281f31902620', false, NULL),
	(3, '2025-10-31 02:53:17.811837+00', '2025-10-31 02:53:17.811837+00', '00000000-0000-0000-0000-000000000001', 'Volta Gold Mine', 'Open-pit and underground combination, 3Mtpa', 'GH-VGM', 4, NULL, NULL, 'b64d182f-0ee3-40a0-b367-281f31902620', false, NULL),
	(4, '2025-10-31 03:30:59.044752+00', '2025-10-31 03:30:59.044752+00', '00000000-0000-0000-0000-000000000001', 'Sahara Mine', '', '', 4, NULL, NULL, 'b64d182f-0ee3-40a0-b367-281f31902620', false, NULL),
	(5, '2025-10-31 02:53:50.557892+00', '2025-10-31 02:53:50.557892+00', '00000000-0000-0000-0000-000000000001', 'Golden Valley Mine', '', '', 2, NULL, NULL, 'b64d182f-0ee3-40a0-b367-281f31902620', false, NULL),
	(6, '2025-10-31 02:59:54.251234+00', '2025-10-31 02:59:54.251234+00', '00000000-0000-0000-0000-000000000001', 'Kilimanjaro Mine', 'Deep underground operation, 800m depth, 1.5Mtpa', 'TZ-KJM', 5, NULL, NULL, 'b64d182f-0ee3-40a0-b367-281f31902620', false, NULL),
	(7, '2025-10-31 03:31:13.250913+00', '2025-10-31 03:31:13.250913+00', '00000000-0000-0000-0000-000000000001', 'Bushveld Mine', '', '', 5, NULL, NULL, 'b64d182f-0ee3-40a0-b367-281f31902620', false, NULL);


--
-- Data for Name: asset_groups; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."asset_groups" ("id", "created_at", "updated_at", "created_by", "site_id", "name", "description", "code", "asset_type", "company_id", "is_deleted", "deleted_at") VALUES
	(1, '2025-10-31 02:53:27.119775+00', '2025-10-31 02:53:27.119775+00', '00000000-0000-0000-0000-000000000001', 1, 'Heavy Mobile Equipment', 'Fleet management for loaders, haul trucks, and dozers', 'KCM-HME', NULL, 'b64d182f-0ee3-40a0-b367-281f31902620', false, NULL),
	(2, '2025-10-31 02:53:35.498229+00', '2025-10-31 02:53:35.498229+00', '00000000-0000-0000-0000-000000000001', 1, 'Fixed Plant & Processing', 'Crushing, milling, and gold recovery circuits', 'KCM-FPP', NULL, 'b64d182f-0ee3-40a0-b367-281f31902620', false, NULL),
	(3, '2025-10-31 02:53:32.40795+00', '2025-10-31 02:53:32.40795+00', '00000000-0000-0000-0000-000000000001', 2, 'Mining Fleet', '', '', NULL, 'b64d182f-0ee3-40a0-b367-281f31902620', false, NULL),
	(4, '2025-10-31 02:53:33.62375+00', '2025-10-31 02:53:33.62375+00', '00000000-0000-0000-0000-000000000001', 2, 'Drill & Blast', '', '', NULL, 'b64d182f-0ee3-40a0-b367-281f31902620', false, NULL),
	(5, '2025-10-31 02:53:36.030661+00', '2025-10-31 02:53:36.030661+00', '00000000-0000-0000-0000-000000000001', 3, 'Open Pit Operations', '', '', NULL, 'b64d182f-0ee3-40a0-b367-281f31902620', false, NULL),
	(6, '2025-10-31 02:53:37.10368+00', '2025-10-31 02:53:37.10368+00', '00000000-0000-0000-0000-000000000001', 3, 'CIL Processing Plant', '', '', NULL, 'b64d182f-0ee3-40a0-b367-281f31902620', false, NULL),
	(7, '2025-10-31 03:29:17.541807+00', '2025-10-31 03:29:17.541807+00', '00000000-0000-0000-0000-000000000001', 2, 'Heap Leach Facility', '', '', NULL, 'b64d182f-0ee3-40a0-b367-281f31902620', false, NULL),
	(8, '2025-10-31 03:29:43.674635+00', '2025-10-31 03:29:43.674635+00', '00000000-0000-0000-0000-000000000001', 5, 'Surface Operations', '', '', NULL, 'b64d182f-0ee3-40a0-b367-281f31902620', false, NULL),
	(9, '2025-10-31 03:00:52.115731+00', '2025-10-31 03:00:52.115731+00', '00000000-0000-0000-0000-000000000001', 1, 'Underground Development', 'Decline development, stoping, and ground support', 'KCM-UGD', NULL, 'b64d182f-0ee3-40a0-b367-281f31902620', false, NULL),
	(10, '2025-10-31 03:00:46.428357+00', '2025-10-31 03:00:46.428357+00', '00000000-0000-0000-0000-000000000001', 1, 'Mine Services & Infrastructure', 'Ventilation, dewatering, power, and communications', 'KCM-MSI', NULL, 'b64d182f-0ee3-40a0-b367-281f31902620', false, NULL),
	(11, '2025-10-31 03:30:00.550749+00', '2025-10-31 03:30:00.550749+00', '00000000-0000-0000-0000-000000000001', 5, 'Underground Operations', '', '', NULL, 'b64d182f-0ee3-40a0-b367-281f31902620', false, NULL);


--
-- Data for Name: questionnaires; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."questionnaires" ("id", "created_at", "updated_at", "name", "description", "created_by", "guidelines", "is_demo", "is_deleted", "deleted_at", "status", "company_id") VALUES
	(1, '2025-10-31 03:36:47.558792+00', '2025-10-31 03:36:47.558792+00', 'Weekly Planner Performance Check-In', 'A questionnaire to assess the weekly performance of planners and identify any concerns from the current week as well as the next week.', '00000000-0000-0000-0000-000000000001', '', false, false, NULL, 'active', 'b64d182f-0ee3-40a0-b367-281f31902620'),
	(2, '2025-10-31 07:56:16.120496+00', '2025-10-31 07:56:16.120496+00', 'Test: Question Elements Answer Types', 'This is a test questionnaire for working with question element answer types.', '00000000-0000-0000-0000-000000000001', '', false, false, NULL, 'active', 'b64d182f-0ee3-40a0-b367-281f31902620');


--
-- Data for Name: programs; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."programs" ("id", "created_at", "updated_at", "created_by", "name", "description", "company_id", "is_deleted", "deleted_at", "current_sequence_number", "is_demo", "onsite_questionnaire_id", "status", "presite_questionnaire_id") VALUES
	(1, '2025-10-31 04:51:20.473312+00', '2025-10-31 04:52:56.851+00', '00000000-0000-0000-0000-000000000001', 'Planner Weekly Check-In', '', 'b64d182f-0ee3-40a0-b367-281f31902620', false, NULL, 1, false, 1, 'draft', NULL);


--
-- Data for Name: program_phases; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."program_phases" ("id", "created_at", "program_id", "sequence_number", "planned_start_date", "actual_start_date", "created_by", "notes", "status", "company_id", "locked_for_analysis_at", "updated_at", "name", "planned_end_date", "actual_end_date", "is_deleted", "deleted_at") VALUES
	(1, '2025-10-31 04:51:20.496185+00', 1, 1, NULL, NULL, '00000000-0000-0000-0000-000000000001', NULL, 'in_progress', 'b64d182f-0ee3-40a0-b367-281f31902620', NULL, '2025-10-31 04:51:20.496185+00', 'Program Assessment - Phase 1', NULL, NULL, false, NULL);


--
-- Data for Name: assessments; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."assessments" ("id", "created_at", "updated_at", "questionnaire_id", "name", "description", "status", "scheduled_at", "started_at", "created_by", "business_unit_id", "region_id", "site_id", "asset_group_id", "is_deleted", "deleted_at", "type", "completed_at", "company_id", "interview_overview", "program_phase_id") VALUES
	(1, '2025-10-31 05:32:42.429842+00', '2025-10-31 05:32:42.429842+00', 1, 'onsite Assessment - Phase 1', NULL, 'draft', NULL, NULL, '00000000-0000-0000-0000-000000000001', NULL, NULL, NULL, NULL, false, NULL, 'onsite', NULL, 'b64d182f-0ee3-40a0-b367-281f31902620', NULL, 1),
	(2, '2025-10-31 08:11:22.844288+00', '2025-10-31 08:11:22.844288+00', 2, 'Test: Question Elements Answer Types', NULL, 'draft', NULL, NULL, '00000000-0000-0000-0000-000000000001', NULL, NULL, NULL, NULL, false, NULL, 'onsite', NULL, 'b64d182f-0ee3-40a0-b367-281f31902620', NULL, NULL);


--
-- Data for Name: assessment_objectives; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."assessment_objectives" ("id", "created_at", "updated_at", "created_by", "assessment_id", "title", "description", "is_deleted", "deleted_at", "company_id") VALUES
	(1, '2025-10-31 08:11:22.864787+00', '2025-10-31 08:11:22.864787+00', '00000000-0000-0000-0000-000000000001', 2, 'Functional Test', 'Test', false, NULL, 'b64d182f-0ee3-40a0-b367-281f31902620');


--
-- Data for Name: contacts; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."contacts" ("id", "created_at", "updated_at", "full_name", "email", "phone", "title", "created_by", "is_deleted", "deleted_at", "company_id") VALUES
	(1, '2025-10-31 03:31:59.079731+00', '2025-10-31 03:31:59.079731+00', 'John Doe', 'tbikaun+jd@teampps.com.au', '', '', '00000000-0000-0000-0000-000000000001', false, NULL, 'b64d182f-0ee3-40a0-b367-281f31902620'),
	(2, '2025-10-31 05:21:33.861052+00', '2025-10-31 05:21:33.861052+00', 'Simon Says', 'tbikaun+planner@teampps.com.au', '', '', '00000000-0000-0000-0000-000000000001', false, NULL, 'b64d182f-0ee3-40a0-b367-281f31902620');


--
-- Data for Name: asset_group_contacts; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: business_unit_contacts; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: company_contacts; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: dashboards; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."dashboards" ("id", "created_at", "updated_at", "created_by", "name", "layout", "company_id", "widgets", "is_deleted", "deleted_at") VALUES
	(1, '2025-10-31 08:08:57.147394+00', '2025-10-31 08:08:57.147394+00', '00000000-0000-0000-0000-000000000001', 'My Dashboard', '[]', 'b64d182f-0ee3-40a0-b367-281f31902620', '[]', false, NULL);


--
-- Data for Name: feedback; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: shared_roles; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."shared_roles" ("id", "created_at", "updated_at", "name", "description", "created_by", "is_deleted", "deleted_at", "company_id") VALUES
	(181, '2025-08-20 02:25:02.050869+00', '2025-08-20 02:25:02.050869+00', 'Asset Management Director', 'Senior executive responsible for overall asset management strategy and portfolio', NULL, false, NULL, NULL),
	(182, '2025-08-20 02:25:02.312445+00', '2025-08-20 02:25:02.312445+00', 'Maintenance Manager', 'Manages overall maintenance operations, budgets, and strategic planning', NULL, false, NULL, NULL),
	(183, '2025-08-20 02:25:02.568924+00', '2025-08-20 02:25:02.568924+00', 'Operations Manager', 'Oversees daily operations and production activities', NULL, false, NULL, NULL),
	(184, '2025-08-20 02:25:02.845479+00', '2025-08-20 02:25:02.845479+00', 'Mine General Manager', 'Senior executive responsible for overall mine operations and strategic management', NULL, false, NULL, NULL),
	(185, '2025-08-20 02:25:03.120218+00', '2025-08-20 02:25:03.120218+00', 'Maintenance Superintendent', 'Senior management role overseeing maintenance departments and strategies', NULL, false, NULL, NULL),
	(186, '2025-08-20 02:25:03.369241+00', '2025-08-20 02:25:03.369241+00', 'Operations Superintendent', 'Senior management role overseeing operations departments and production strategies', NULL, false, NULL, NULL),
	(187, '2025-08-20 02:25:03.625008+00', '2025-08-20 02:25:03.625008+00', 'Reliability Manager', 'Leads reliability initiatives and asset performance optimisation', NULL, false, NULL, NULL),
	(188, '2025-08-20 02:25:03.884552+00', '2025-08-20 02:25:03.884552+00', 'Maintenance Supervisor', 'Supervises daily maintenance activities and technician teams', NULL, false, NULL, NULL),
	(189, '2025-08-20 02:25:04.149737+00', '2025-08-20 02:25:04.149737+00', 'Operations Supervisor', 'Supervises daily operations and production staff', NULL, false, NULL, NULL),
	(190, '2025-08-20 02:25:04.397368+00', '2025-08-20 02:25:04.397368+00', 'Planning Supervisor', 'Supervises planning activities and coordinates planning team operations', NULL, false, NULL, NULL),
	(191, '2025-08-20 02:25:04.647613+00', '2025-08-20 02:25:04.647613+00', 'Shift Supervisor', 'Manages operations and maintenance activities during specific shifts', NULL, false, NULL, NULL),
	(192, '2025-08-20 02:25:04.902882+00', '2025-08-20 02:25:04.902882+00', 'Area Supervisor', 'Supervises activities within a specific plant area or unit', NULL, false, NULL, NULL),
	(193, '2025-08-20 02:25:05.159542+00', '2025-08-20 02:25:05.159542+00', 'Reliability Engineer', 'Analyses equipment performance and develops reliability improvement strategies', NULL, false, NULL, NULL),
	(194, '2025-08-20 02:25:05.406002+00', '2025-08-20 02:25:05.406002+00', 'Maintenance Engineer', 'Provides technical expertise for maintenance planning and problem-solving', NULL, false, NULL, NULL),
	(195, '2025-08-20 02:25:05.684138+00', '2025-08-20 02:25:05.684138+00', 'Process Engineer', 'Optimises manufacturing processes and equipment performance', NULL, false, NULL, NULL),
	(196, '2025-08-20 02:25:05.929838+00', '2025-08-20 02:25:05.929838+00', 'Continuous Improvement Engineer', 'Develops and implements continuous improvement initiatives and process optimisation', NULL, false, NULL, NULL),
	(197, '2025-08-20 02:25:06.179119+00', '2025-08-20 02:25:06.179119+00', 'Mechanical Engineer', 'Specialises in mechanical systems design, analysis, and maintenance', NULL, false, NULL, NULL),
	(198, '2025-08-20 02:25:06.44759+00', '2025-08-20 02:25:06.44759+00', 'Electrical Engineer', 'Handles electrical systems design, maintenance, and troubleshooting', NULL, false, NULL, NULL),
	(199, '2025-08-20 02:25:06.705179+00', '2025-08-20 02:25:06.705179+00', 'Instrumentation Engineer', 'Manages control systems, instrumentation, and automation equipment', NULL, false, NULL, NULL),
	(200, '2025-08-20 02:25:06.995063+00', '2025-08-20 02:25:06.995063+00', 'Maintenance Planner', 'Plans and schedules maintenance activities and resource allocation', NULL, false, NULL, NULL),
	(201, '2025-08-20 02:25:07.245194+00', '2025-08-20 02:25:07.245194+00', 'Planner', 'Develops detailed work plans and resource requirements for maintenance tasks', NULL, false, NULL, NULL),
	(202, '2025-08-20 02:25:07.502739+00', '2025-08-20 02:25:07.502739+00', 'Scheduler', 'Coordinates timing and sequencing of maintenance and operations activities', NULL, false, NULL, NULL),
	(203, '2025-08-20 02:25:07.75589+00', '2025-08-20 02:25:07.75589+00', 'Work Order Coordinator', 'Manages work order processes and coordinates between departments', NULL, false, NULL, NULL),
	(204, '2025-08-20 02:25:08.005198+00', '2025-08-20 02:25:08.005198+00', 'Maintenance Coordinator', 'Coordinates maintenance activities and resources across departments', NULL, false, NULL, NULL),
	(205, '2025-08-20 02:25:08.255824+00', '2025-08-20 02:25:08.255824+00', 'Process Asset Manager', 'Manages process-related assets and optimises asset performance within production processes', NULL, false, NULL, NULL),
	(206, '2025-08-20 02:25:08.502396+00', '2025-08-20 02:25:08.502396+00', 'Continuous Improvement Reviewer', 'Reviews and evaluates continuous improvement initiatives and their effectiveness', NULL, false, NULL, NULL),
	(207, '2025-08-20 02:25:08.748416+00', '2025-08-20 02:25:08.748416+00', 'Maintenance Technician', 'Performs hands-on maintenance, repairs, and preventive maintenance tasks', NULL, false, NULL, NULL),
	(208, '2025-08-20 02:25:09.007388+00', '2025-08-20 02:25:09.007388+00', 'Maintainer', 'General maintenance worker performing various repair and upkeep tasks', NULL, false, NULL, NULL),
	(209, '2025-08-20 02:25:09.286773+00', '2025-08-20 02:25:09.286773+00', 'Mechanic', 'Specialises in mechanical equipment repair and maintenance', NULL, false, NULL, NULL),
	(210, '2025-08-20 02:25:09.5472+00', '2025-08-20 02:25:09.5472+00', 'Electrician', 'Performs electrical installation, maintenance, and repair work', NULL, false, NULL, NULL),
	(211, '2025-08-20 02:25:09.82639+00', '2025-08-20 02:25:09.82639+00', 'Instrumentation Technician', 'Maintains and calibrates control instruments and automation systems', NULL, false, NULL, NULL),
	(212, '2025-08-20 02:25:10.131623+00', '2025-08-20 02:25:10.131623+00', 'Process Operator', 'Operates production equipment and monitors process parameters', NULL, false, NULL, NULL),
	(213, '2025-08-20 02:25:10.386786+00', '2025-08-20 02:25:10.386786+00', 'Equipment Operator', 'Operates specific types of machinery or equipment', NULL, false, NULL, NULL),
	(214, '2025-08-20 02:25:10.63348+00', '2025-08-20 02:25:10.63348+00', 'Operator', 'General equipment operator responsible for running production systems', NULL, false, NULL, NULL),
	(215, '2025-08-20 02:25:10.881644+00', '2025-08-20 02:25:10.881644+00', 'Vibration Analyst', 'Specialises in vibration analysis for predictive maintenance programs', NULL, false, NULL, NULL),
	(216, '2025-08-20 02:25:11.131533+00', '2025-08-20 02:25:11.131533+00', 'Lubrication Specialist', 'Manages lubrication programs and oil analysis activities', NULL, false, NULL, NULL),
	(217, '2025-08-20 02:25:11.382388+00', '2025-08-20 02:25:11.382388+00', 'Predictive Maintenance Technician', 'Performs condition monitoring and predictive maintenance techniques', NULL, false, NULL, NULL),
	(218, '2025-08-20 02:25:11.628371+00', '2025-08-20 02:25:11.628371+00', 'Condition Monitoring Specialist', 'Monitors equipment condition using various diagnostic techniques', NULL, false, NULL, NULL),
	(219, '2025-08-20 02:25:11.93062+00', '2025-08-20 02:25:11.93062+00', 'Thermographer', 'Uses thermal imaging for equipment condition assessment', NULL, false, NULL, NULL),
	(220, '2025-08-20 02:25:12.172878+00', '2025-08-20 02:25:12.172878+00', 'Safety Officer', 'Ensures compliance with safety regulations and promotes safe work practices', NULL, false, NULL, NULL),
	(221, '2025-08-20 02:25:12.435826+00', '2025-08-20 02:25:12.435826+00', 'Environmental Officer', 'Manages environmental compliance and sustainability initiatives', NULL, false, NULL, NULL),
	(222, '2025-08-20 02:25:12.756285+00', '2025-08-20 02:25:12.756285+00', 'Quality Inspector', 'Inspects products and processes to ensure quality standards', NULL, false, NULL, NULL),
	(223, '2025-08-20 02:25:13.0146+00', '2025-08-20 02:25:13.0146+00', 'Training Coordinator', 'Develops and coordinates training programs for operations and maintenance staff', NULL, false, NULL, NULL),
	(224, '2025-08-20 02:25:13.271534+00', '2025-08-20 02:25:13.271534+00', 'Auditor', 'Conducts audits of processes, procedures, and compliance activities', NULL, false, NULL, NULL),
	(225, '2025-08-20 02:25:13.520626+00', '2025-08-20 02:25:13.520626+00', 'Asset Performance Analyst', 'Analyses asset performance data and generates improvement recommendations', NULL, false, NULL, NULL),
	(226, '2025-08-20 02:25:13.766496+00', '2025-08-20 02:25:13.766496+00', 'CMMS Administrator', 'Manages computerised maintenance management systems and data integrity', NULL, false, NULL, NULL),
	(227, '2025-08-20 02:25:14.016713+00', '2025-08-20 02:25:14.016713+00', 'Materials Coordinator', 'Manages spare parts inventory and procurement for maintenance activities', NULL, false, NULL, NULL),
	(228, '2025-08-20 02:25:14.276559+00', '2025-08-20 02:25:14.276559+00', 'Contractor Coordinator', 'Manages external contractors and vendor relationships for maintenance work', NULL, false, NULL, NULL),
	(229, '2025-08-20 02:25:14.538165+00', '2025-08-20 02:25:14.538165+00', 'Shutdown Coordinator', 'Plans and coordinates major maintenance shutdowns and turnarounds', NULL, false, NULL, NULL),
	(230, '2025-08-20 02:25:14.786157+00', '2025-08-20 02:25:14.786157+00', 'Planning and Reliability Superintendent', 'Oversees maintenance planning strategies and reliability programs to optimize asset performance and equipment uptime', NULL, false, NULL, NULL),
	(231, '2025-08-20 02:25:14.786157+00', '2025-08-20 02:25:14.786157+00', 'Heavy Diesel Fitter', 'Performs mechanical repairs on heavy mobile equipment', NULL, false, NULL, NULL),
	(232, '2025-08-20 02:25:14.786157+00', '2025-08-20 02:25:14.786157+00', 'Auto Electrician', 'Maintains and repairs electrical systems on mobile equipment', NULL, false, NULL, NULL),
	(233, '2025-08-20 02:25:14.786157+00', '2025-08-20 02:25:14.786157+00', 'Production Superintendent', 'Manages production targets and operational efficiency', NULL, false, NULL, NULL);


--
-- Data for Name: work_groups; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."work_groups" ("id", "created_at", "updated_at", "created_by", "name", "description", "code", "company_id", "is_deleted", "deleted_at", "asset_group_id") VALUES
	(1, '2025-10-31 03:01:19.023502+00', '2025-10-31 03:01:19.023502+00', '00000000-0000-0000-0000-000000000001', 'Maintenance', 'Preventive and corrective maintenance for mobile fleet', 'HME-MAINT', 'b64d182f-0ee3-40a0-b367-281f31902620', false, NULL, 1),
	(2, '2025-10-31 03:01:20.04558+00', '2025-10-31 03:01:20.04558+00', '00000000-0000-0000-0000-000000000001', 'Operations', 'Equipment operation and production execution', 'HME-OPS', 'b64d182f-0ee3-40a0-b367-281f31902620', false, NULL, 1),
	(3, '2025-10-31 03:01:20.587614+00', '2025-10-31 03:01:20.587614+00', '00000000-0000-0000-0000-000000000001', 'Planning', 'Maintenance planning, scheduling, and parts management', 'HME-PLAN', 'b64d182f-0ee3-40a0-b367-281f31902620', false, NULL, 1),
	(4, '2025-10-31 03:25:14.722434+00', '2025-10-31 03:25:14.722434+00', '00000000-0000-0000-0000-000000000001', 'Process Operations', 'Operates processing plant and recovery circuits', 'FPP-OPS', 'b64d182f-0ee3-40a0-b367-281f31902620', false, NULL, 2),
	(5, '2025-10-31 03:25:24.094601+00', '2025-10-31 03:25:24.094601+00', '00000000-0000-0000-0000-000000000001', 'Process Maintenance', 'FPP-MAINT', 'Maintains fixed plant equipment and infrastructure', 'b64d182f-0ee3-40a0-b367-281f31902620', false, NULL, 2),
	(6, '2025-10-31 03:26:17.473978+00', '2025-10-31 03:26:17.473978+00', '00000000-0000-0000-0000-000000000001', 'Development Operations', 'Underground development and production mining', 'UGD-OPS', 'b64d182f-0ee3-40a0-b367-281f31902620', false, NULL, 9),
	(7, '2025-10-31 03:26:18.179985+00', '2025-10-31 03:26:18.179985+00', '00000000-0000-0000-0000-000000000001', 'Ground Support', 'Rock mechanics and ground stabilization', 'UGD-GROUND', 'b64d182f-0ee3-40a0-b367-281f31902620', false, NULL, 9),
	(8, '2025-10-31 03:27:00.218223+00', '2025-10-31 03:27:00.218223+00', '00000000-0000-0000-0000-000000000001', 'Services Operations', 'Maintains critical mine services and infrastructure', 'MSI-OPS', 'b64d182f-0ee3-40a0-b367-281f31902620', false, NULL, 10),
	(9, '2025-10-31 03:27:01.273587+00', '2025-10-31 03:27:01.273587+00', '00000000-0000-0000-0000-000000000001', 'Electrical & Instrumentation', 'Power distribution and control systems', 'MSI-ELEC', 'b64d182f-0ee3-40a0-b367-281f31902620', false, NULL, 10);


--
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."roles" ("id", "created_at", "updated_at", "created_by", "code", "company_id", "shared_role_id", "is_deleted", "deleted_at", "level", "work_group_id", "reports_to_role_id") VALUES
	(1, '2025-10-31 03:11:32.703477+00', '2025-10-31 03:11:32.703477+00', '00000000-0000-0000-0000-000000000001', NULL, 'b64d182f-0ee3-40a0-b367-281f31902620', 230, false, NULL, 'supervisor', 3, NULL),
	(2, '2025-10-31 03:11:50.423296+00', '2025-10-31 03:11:50.423296+00', '00000000-0000-0000-0000-000000000001', NULL, 'b64d182f-0ee3-40a0-b367-281f31902620', 201, false, NULL, 'professional', 3, 1),
	(3, '2025-10-31 03:11:59.215436+00', '2025-10-31 03:11:59.215436+00', '00000000-0000-0000-0000-000000000001', NULL, 'b64d182f-0ee3-40a0-b367-281f31902620', 202, false, NULL, 'professional', 3, 1),
	(4, '2025-10-31 03:20:54.778239+00', '2025-10-31 03:20:54.778239+00', '00000000-0000-0000-0000-000000000001', NULL, 'b64d182f-0ee3-40a0-b367-281f31902620', 185, false, NULL, 'supervisor', 1, NULL),
	(5, '2025-10-31 03:21:06.878918+00', '2025-10-31 03:21:06.878918+00', '00000000-0000-0000-0000-000000000001', NULL, 'b64d182f-0ee3-40a0-b367-281f31902620', 188, false, NULL, 'supervisor', 1, 4),
	(6, '2025-10-31 04:55:43.642373+00', '2025-10-31 04:55:43.642373+00', '00000000-0000-0000-0000-000000000001', NULL, 'b64d182f-0ee3-40a0-b367-281f31902620', 207, false, NULL, 'technician', 1, 4),
	(7, '2025-10-31 03:24:41.796011+00', '2025-10-31 03:24:41.796011+00', '00000000-0000-0000-0000-000000000001', NULL, 'b64d182f-0ee3-40a0-b367-281f31902620', 193, false, NULL, 'specialist', 3, 1);


--
-- Data for Name: interviews; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."interviews" ("id", "created_at", "updated_at", "created_by", "interviewer_id", "assessment_id", "notes", "name", "is_individual", "access_code", "assigned_role_id", "enabled", "is_deleted", "deleted_at", "status", "program_id", "questionnaire_id", "company_id", "interview_contact_id", "program_phase_id", "interviewee_id", "due_at", "completed_at") VALUES
	(1, '2025-10-31 05:32:42.685577+00', '2025-10-31 05:32:42.685577+00', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 1, NULL, 'onsite Interview - Phase 1', true, '8807a347', NULL, true, false, NULL, 'pending', 1, 1, 'b64d182f-0ee3-40a0-b367-281f31902620', 2, 1, 'd34835f8-a043-42f9-a376-6aac23cb76ce', NULL, NULL),
	(2, '2025-10-31 05:32:51.563903+00', '2025-10-31 05:32:51.563903+00', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 1, NULL, 'onsite Interview - Group', false, NULL, NULL, true, false, NULL, 'pending', 1, 1, 'b64d182f-0ee3-40a0-b367-281f31902620', NULL, 1, NULL, NULL, NULL),
	(3, '2025-10-31 08:11:45.311254+00', '2025-10-31 08:11:45.311254+00', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 2, NULL, 'Individual Interview - 31/10/2025', true, 'cca39c29', NULL, true, false, NULL, 'pending', NULL, 2, 'b64d182f-0ee3-40a0-b367-281f31902620', 1, NULL, 'd5f1252a-9d56-47f8-98cf-f6f34914bb6c', NULL, NULL);


--
-- Data for Name: questionnaire_sections; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."questionnaire_sections" ("id", "created_at", "updated_at", "questionnaire_id", "title", "order_index", "expanded", "created_by", "is_deleted", "deleted_at", "company_id") VALUES
	(1, '2025-10-31 03:42:17.684916+00', '2025-10-31 03:42:17.684916+00', 1, 'Planning & Scheduling Effectiveness', 1, true, '00000000-0000-0000-0000-000000000001', false, NULL, 'b64d182f-0ee3-40a0-b367-281f31902620'),
	(2, '2025-10-31 03:42:25.926346+00', '2025-10-31 03:42:25.926346+00', 1, 'Resource Coordination', 2, true, '00000000-0000-0000-0000-000000000001', false, NULL, 'b64d182f-0ee3-40a0-b367-281f31902620'),
	(3, '2025-10-31 03:42:37.10649+00', '2025-10-31 03:42:37.10649+00', 1, 'Risk & Compliance', 3, true, '00000000-0000-0000-0000-000000000001', false, NULL, 'b64d182f-0ee3-40a0-b367-281f31902620'),
	(4, '2025-10-31 03:42:44.351129+00', '2025-10-31 03:42:44.351129+00', 1, 'Communication & Support', 4, true, '00000000-0000-0000-0000-000000000001', false, NULL, 'b64d182f-0ee3-40a0-b367-281f31902620'),
	(5, '2025-10-31 03:42:54.386878+00', '2025-10-31 03:42:54.386878+00', 1, 'Improvement & Outlook', 5, true, '00000000-0000-0000-0000-000000000001', false, NULL, 'b64d182f-0ee3-40a0-b367-281f31902620'),
	(6, '2025-10-31 08:02:31.663964+00', '2025-10-31 08:02:41.157+00', 2, 'Test Section', 1, true, '00000000-0000-0000-0000-000000000001', false, NULL, 'b64d182f-0ee3-40a0-b367-281f31902620');


--
-- Data for Name: questionnaire_steps; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."questionnaire_steps" ("id", "created_at", "updated_at", "title", "order_index", "expanded", "questionnaire_section_id", "created_by", "deleted_at", "is_deleted", "questionnaire_id", "company_id") VALUES
	(1, '2025-10-31 03:43:04.188499+00', '2025-10-31 03:43:04.188499+00', 'Workload Assessment', 1, true, 1, '00000000-0000-0000-0000-000000000001', NULL, false, 1, 'b64d182f-0ee3-40a0-b367-281f31902620'),
	(2, '2025-10-31 03:44:15.218787+00', '2025-10-31 03:44:15.218787+00', 'Planning Quality', 2, true, 1, '00000000-0000-0000-0000-000000000001', NULL, false, 1, 'b64d182f-0ee3-40a0-b367-281f31902620'),
	(3, '2025-10-31 03:44:28.098284+00', '2025-10-31 03:44:28.098284+00', 'Resource Availability', 1, true, 2, '00000000-0000-0000-0000-000000000001', NULL, false, 1, 'b64d182f-0ee3-40a0-b367-281f31902620'),
	(4, '2025-10-31 03:44:39.496052+00', '2025-10-31 03:44:39.496052+00', 'Contractor Management', 2, true, 2, '00000000-0000-0000-0000-000000000001', NULL, false, 1, 'b64d182f-0ee3-40a0-b367-281f31902620'),
	(5, '2025-10-31 03:44:52.724659+00', '2025-10-31 03:44:52.724659+00', 'Safety & Compliance', 1, true, 3, '00000000-0000-0000-0000-000000000001', NULL, false, 1, 'b64d182f-0ee3-40a0-b367-281f31902620'),
	(6, '2025-10-31 03:44:59.565723+00', '2025-10-31 03:44:59.565723+00', 'Critical Asset Focus', 2, true, 3, '00000000-0000-0000-0000-000000000001', NULL, false, 1, 'b64d182f-0ee3-40a0-b367-281f31902620'),
	(7, '2025-10-31 03:45:06.092177+00', '2025-10-31 03:45:06.092177+00', 'Stakeholder Interaction', 1, true, 4, '00000000-0000-0000-0000-000000000001', NULL, false, 1, 'b64d182f-0ee3-40a0-b367-281f31902620'),
	(8, '2025-10-31 03:45:12.168712+00', '2025-10-31 03:45:12.168712+00', 'System & Tools', 2, true, 4, '00000000-0000-0000-0000-000000000001', NULL, false, 1, 'b64d182f-0ee3-40a0-b367-281f31902620'),
	(9, '2025-10-31 03:45:17.626935+00', '2025-10-31 03:45:17.626935+00', 'Continuous Improvement', 1, true, 5, '00000000-0000-0000-0000-000000000001', NULL, false, 1, 'b64d182f-0ee3-40a0-b367-281f31902620'),
	(10, '2025-10-31 03:45:22.704217+00', '2025-10-31 03:45:22.704217+00', 'Next Week Preparation', 2, true, 5, '00000000-0000-0000-0000-000000000001', NULL, false, 1, 'b64d182f-0ee3-40a0-b367-281f31902620'),
	(11, '2025-10-31 08:02:46.534681+00', '2025-10-31 08:02:46.534681+00', 'Test Step', 1, true, 6, '00000000-0000-0000-0000-000000000001', NULL, false, 2, 'b64d182f-0ee3-40a0-b367-281f31902620');


--
-- Data for Name: questionnaire_questions; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."questionnaire_questions" ("id", "created_at", "updated_at", "questionnaire_step_id", "question_text", "context", "order_index", "created_by", "title", "is_deleted", "deleted_at", "questionnaire_id", "company_id", "rating_scale_mapping") VALUES
	(1, '2025-10-31 03:43:19.193059+00', '2025-10-31 03:50:58.339+00', 1, '', 'This helps us understand if workload is sustainable and identify when additional resources or prioritization changes are needed. Be honest about capacity - overload leads to quality issues downstream.', 1, '00000000-0000-0000-0000-000000000001', 'How would you rate your current workload management?', false, NULL, 1, 'b64d182f-0ee3-40a0-b367-281f31902620', '{"version": "weighted", "partScoring": {"1": [{"max": 50, "min": 0, "level": 5}, {"max": 100, "min": 51, "level": 4}, {"max": 150, "min": 101, "level": 3}, {"max": 200, "min": 151, "level": 2}, {"max": 250, "min": 201, "level": 1}], "2": [{"max": 19.99, "min": 0, "level": 1}, {"max": 39.99, "min": 20, "level": 2}, {"max": 59.99, "min": 40, "level": 3}, {"max": 79.99, "min": 60, "level": 4}, {"max": 100, "min": 80, "level": 5}], "3": [{"max": 1.79, "min": 1, "level": 1}, {"max": 2.59, "min": 1.8, "level": 2}, {"max": 3.39, "min": 2.6, "level": 3}, {"max": 4.19, "min": 3.4, "level": 4}, {"max": 5, "min": 4.2, "level": 5}]}}'),
	(2, '2025-10-31 03:44:01.709457+00', '2025-10-31 04:02:19.786+00', 1, '', 'Understanding recurring obstacles helps management remove systemic barriers. Focus on issues outside your direct control that impacted your ability to create effective schedules.', 2, '00000000-0000-0000-0000-000000000001', 'What scheduling challenges did you face?', false, NULL, 1, 'b64d182f-0ee3-40a0-b367-281f31902620', '{"version": "weighted", "partScoring": {"4": {"None": 1, "Other": 5, "Weather": 4, "Parts/Materials": 2, "Equipment access": 3, "Labor availability": 2, "Permit/Documentation": 4}, "5": [{"max": 19.99, "min": 0, "level": 1}, {"max": 39.99, "min": 20, "level": 2}, {"max": 59.99, "min": 40, "level": 3}, {"max": 79.99, "min": 60, "level": 4}, {"max": 100, "min": 80, "level": 5}]}}'),
	(3, '2025-10-31 03:44:20.934404+00', '2025-10-31 04:02:55.244+00', 2, '', 'This measures planning accuracy, not execution. Good planning means crews had clear instructions, correct materials, and realistic time estimates. This helps identify if we need better job history data or planning standards.', 1, '00000000-0000-0000-0000-000000000001', 'How effective was your job planning this week?', false, NULL, 1, 'b64d182f-0ee3-40a0-b367-281f31902620', '{"version": "weighted", "partScoring": {"6": [{"max": 19.99, "min": 0, "level": 1}, {"max": 39.99, "min": 20, "level": 2}, {"max": 59.99, "min": 40, "level": 3}, {"max": 79.99, "min": 60, "level": 4}, {"max": 100, "min": 80, "level": 5}], "7": [{"max": 199.79, "min": 0, "level": 1}, {"max": 399.59, "min": 199.8, "level": 2}, {"max": 599.39, "min": 399.6, "level": 3}, {"max": 799.19, "min": 599.4, "level": 4}, {"max": 999, "min": 799.2, "level": 5}], "8": [{"max": 1.79, "min": 1, "level": 1}, {"max": 2.59, "min": 1.8, "level": 2}, {"max": 3.39, "min": 2.6, "level": 3}, {"max": 4.19, "min": 3.4, "level": 4}, {"max": 5, "min": 4.2, "level": 5}]}}'),
	(4, '2025-10-31 03:44:34.041204+00', '2025-10-31 04:03:35.908+00', 3, '', 'Identifies gaps between what''s needed vs. available. This data supports business cases for resources and helps optimize allocation. Consider both human resources and physical assets.', 1, '00000000-0000-0000-0000-000000000001', 'Rate your resource coordination success', false, NULL, 1, 'b64d182f-0ee3-40a0-b367-281f31902620', '{"version": "weighted", "partScoring": {"9": [{"max": 19.99, "min": 0, "level": 1}, {"max": 39.99, "min": 20, "level": 2}, {"max": 59.99, "min": 40, "level": 3}, {"max": 79.99, "min": 60, "level": 4}, {"max": 100, "min": 80, "level": 5}], "10": [{"max": 19.79, "min": 0, "level": 1}, {"max": 39.59, "min": 19.8, "level": 2}, {"max": 59.39, "min": 39.6, "level": 3}, {"max": 79.19, "min": 59.4, "level": 4}, {"max": 99, "min": 79.2, "level": 5}], "11": [{"max": 19.79, "min": 0, "level": 1}, {"max": 39.59, "min": 19.8, "level": 2}, {"max": 59.39, "min": 39.6, "level": 3}, {"max": 79.19, "min": 59.4, "level": 4}, {"max": 99, "min": 79.2, "level": 5}]}}'),
	(5, '2025-10-31 03:44:45.058905+00', '2025-10-31 04:04:02.018+00', 4, '', 'Contractor work often represents significant spend and critical path items. Early identification of contractor issues prevents schedule slippage and budget overruns. Skip if no contractor work this week.', 1, '00000000-0000-0000-0000-000000000001', 'If applicable, how smooth was contractor coordination?', false, NULL, 1, 'b64d182f-0ee3-40a0-b367-281f31902620', '{"version": "weighted", "partScoring": {"12": [{"max": 19.79, "min": 0, "level": 1}, {"max": 39.59, "min": 19.8, "level": 2}, {"max": 59.39, "min": 39.6, "level": 3}, {"max": 79.19, "min": 59.4, "level": 4}, {"max": 99, "min": 79.2, "level": 5}], "13": [{"max": 1.79, "min": 1, "level": 1}, {"max": 2.59, "min": 1.8, "level": 2}, {"max": 3.39, "min": 2.6, "level": 3}, {"max": 4.19, "min": 3.4, "level": 4}, {"max": 5, "min": 4.2, "level": 5}]}}'),
	(6, '2025-10-31 03:46:35.486237+00', '2025-10-31 04:04:29.554+00', 5, '', 'Safety is our top priority. This ensures we''re not rushing planning at the expense of proper safety preparation. Include permits, isolations, confined space requirements, etc. Honest reporting prevents incidents.', 1, '00000000-0000-0000-0000-000000000001', 'Were all safety requirements met in planning?', false, NULL, 1, 'b64d182f-0ee3-40a0-b367-281f31902620', '{"version": "weighted", "partScoring": {"14": [{"max": 199.79, "min": 0, "level": 1}, {"max": 399.59, "min": 199.8, "level": 2}, {"max": 599.39, "min": 399.6, "level": 3}, {"max": 799.19, "min": 599.4, "level": 4}, {"max": 999, "min": 799.2, "level": 5}], "15": {"true": 5, "false": 1}, "16": [{"max": 19.99, "min": 0, "level": 1}, {"max": 39.99, "min": 20, "level": 2}, {"max": 59.99, "min": 40, "level": 3}, {"max": 79.99, "min": 60, "level": 4}, {"max": 100, "min": 80, "level": 5}]}}'),
	(7, '2025-10-31 03:46:56.157748+00', '2025-10-31 04:04:44.406+00', 6, '', 'Ensures we''re protecting revenue-generating and safety-critical equipment. Your planning should reflect asset criticality rankings. This helps validate if our criticality assignments align with planning reality.', 1, '00000000-0000-0000-0000-000000000001', 'How well did you prioritize critical assets?', false, NULL, 1, 'b64d182f-0ee3-40a0-b367-281f31902620', '{"version": "weighted", "partScoring": {"17": [{"max": 19.99, "min": 0, "level": 1}, {"max": 39.99, "min": 20, "level": 2}, {"max": 59.99, "min": 40, "level": 3}, {"max": 79.99, "min": 60, "level": 4}, {"max": 100, "min": 80, "level": 5}], "18": {"true": 5, "false": 1}}}'),
	(8, '2025-10-31 03:47:09.08131+00', '2025-10-31 04:05:17.118+00', 7, '', 'Good planning means nothing without good communication. This identifies if information flows are working both ways - from operations to planning and from planning to execution. Consider formal and informal channels.', 1, '00000000-0000-0000-0000-000000000001', 'Rate this week''s communication effectiveness', false, NULL, 1, 'b64d182f-0ee3-40a0-b367-281f31902620', '{"version": "weighted", "partScoring": {"19": [{"max": 1.79, "min": 1, "level": 1}, {"max": 2.59, "min": 1.8, "level": 2}, {"max": 3.39, "min": 2.6, "level": 3}, {"max": 4.19, "min": 3.4, "level": 4}, {"max": 5, "min": 4.2, "level": 5}], "20": [{"max": 1.79, "min": 1, "level": 1}, {"max": 2.59, "min": 1.8, "level": 2}, {"max": 3.39, "min": 2.6, "level": 3}, {"max": 4.19, "min": 3.4, "level": 4}, {"max": 5, "min": 4.2, "level": 5}], "21": [{"max": 19.79, "min": 0, "level": 1}, {"max": 39.59, "min": 19.8, "level": 2}, {"max": 59.39, "min": 39.6, "level": 3}, {"max": 79.19, "min": 59.4, "level": 4}, {"max": 99, "min": 79.2, "level": 5}]}}'),
	(9, '2025-10-31 03:47:25.431594+00', '2025-10-31 04:05:39.564+00', 8, '', 'Identifies if technology is enabling or hindering your work. Include CMMS, scheduling tools, and data systems. Poor tools shouldn''t be accepted as normal - this data supports improvement investments.', 1, '00000000-0000-0000-0000-000000000001', 'How well did planning systems support you?', false, NULL, 1, 'b64d182f-0ee3-40a0-b367-281f31902620', '{"version": "weighted", "partScoring": {"22": [{"max": 1.79, "min": 1, "level": 1}, {"max": 2.59, "min": 1.8, "level": 2}, {"max": 3.39, "min": 2.6, "level": 3}, {"max": 4.19, "min": 3.4, "level": 4}, {"max": 5, "min": 4.2, "level": 5}], "23": [{"max": 19.79, "min": 0, "level": 1}, {"max": 39.59, "min": 19.8, "level": 2}, {"max": 59.39, "min": 39.6, "level": 3}, {"max": 79.19, "min": 59.4, "level": 4}, {"max": 99, "min": 79.2, "level": 5}]}}'),
	(10, '2025-10-31 03:47:44.774673+00', '2025-10-31 04:06:42.179+00', 9, '', 'You''re closest to the planning process and see inefficiencies others might miss. Think about repetitive tasks that could be automated, missing procedures, or process gaps. Your input drives our improvement initiatives.', 1, '00000000-0000-0000-0000-000000000001', 'What improvement opportunities did you identify?', false, NULL, 1, 'b64d182f-0ee3-40a0-b367-281f31902620', '{"version": "weighted", "partScoring": {"24": {"Other": 5, "Resources": 4, "Communication": 3, "Documentation": 4, "Systems/Tools": 2, "None identified": 1, "Training/Skills": 3, "Process/Workflow": 2}, "25": [{"max": 7.99, "min": 0, "level": 1}, {"max": 15.99, "min": 8, "level": 2}, {"max": 23.99, "min": 16, "level": 3}, {"max": 31.99, "min": 24, "level": 4}, {"max": 40, "min": 32, "level": 5}]}}'),
	(11, '2025-10-31 03:47:50.937969+00', '2025-10-31 04:08:07.294+00', 10, '', 'Proactive planning prevents reactive chaos. This helps identify if you have sufficient lead time and support. Be specific about barriers to preparation - vague concerns can''t be addressed.', 1, '00000000-0000-0000-0000-000000000001', 'How prepared are you for next week?', false, NULL, 1, 'b64d182f-0ee3-40a0-b367-281f31902620', '{"version": "weighted", "partScoring": {"26": [{"max": 19.99, "min": 0, "level": 1}, {"max": 39.99, "min": 20, "level": 2}, {"max": 59.99, "min": 40, "level": 3}, {"max": 79.99, "min": 60, "level": 4}, {"max": 100, "min": 80, "level": 5}], "27": {"Low - Well controlled": 1, "Medium - Some concerns": 2, "High - Significant challenges": 4, "Critical - Major issues expected": 5}, "28": {"Other": 5, "None needed": 1, "Training/guidance": 4, "System/tool issues": 3, "Resource allocation": 2, "Stakeholder alignment": 4, "Priority clarification": 2}}}'),
	(12, '2025-10-31 08:02:52.774986+00', '2025-10-31 08:04:15.698+00', 11, '', 'Placeholder context', 1, '00000000-0000-0000-0000-000000000001', 'Test Question', false, NULL, 2, 'b64d182f-0ee3-40a0-b367-281f31902620', '{"version": "weighted", "partScoring": {"29": {"true": 2, "false": 1}, "30": [{"max": 2.99, "min": 1, "level": 1}, {"max": 5, "min": 3, "level": 2}], "31": {"No": 1, "Yes": 2, "Partially": 2}, "32": [{"max": 49.99, "min": 0, "level": 1}, {"max": 100, "min": 50, "level": 2}], "33": [{"max": 5.49, "min": 1, "level": 1}, {"max": 10, "min": 5.5, "level": 2}]}}');


--
-- Data for Name: interview_responses; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."interview_responses" ("id", "created_at", "updated_at", "rating_score", "comments", "answered_at", "created_by", "interview_id", "questionnaire_question_id", "is_deleted", "deleted_at", "is_applicable", "company_id", "is_unknown", "score_source") VALUES
	(1, '2025-10-31 05:32:42.717337+00', '2025-10-31 05:32:42.717337+00', NULL, NULL, NULL, '00000000-0000-0000-0000-000000000001', 1, 1, false, NULL, true, 'b64d182f-0ee3-40a0-b367-281f31902620', false, 'direct'),
	(2, '2025-10-31 05:32:42.717337+00', '2025-10-31 05:32:42.717337+00', NULL, NULL, NULL, '00000000-0000-0000-0000-000000000001', 1, 2, false, NULL, true, 'b64d182f-0ee3-40a0-b367-281f31902620', false, 'direct'),
	(3, '2025-10-31 05:32:42.717337+00', '2025-10-31 05:32:42.717337+00', NULL, NULL, NULL, '00000000-0000-0000-0000-000000000001', 1, 3, false, NULL, true, 'b64d182f-0ee3-40a0-b367-281f31902620', false, 'direct'),
	(4, '2025-10-31 05:32:42.717337+00', '2025-10-31 05:32:42.717337+00', NULL, NULL, NULL, '00000000-0000-0000-0000-000000000001', 1, 4, false, NULL, true, 'b64d182f-0ee3-40a0-b367-281f31902620', false, 'direct'),
	(5, '2025-10-31 05:32:42.717337+00', '2025-10-31 05:32:42.717337+00', NULL, NULL, NULL, '00000000-0000-0000-0000-000000000001', 1, 5, false, NULL, true, 'b64d182f-0ee3-40a0-b367-281f31902620', false, 'direct'),
	(6, '2025-10-31 05:32:42.717337+00', '2025-10-31 05:32:42.717337+00', NULL, NULL, NULL, '00000000-0000-0000-0000-000000000001', 1, 6, false, NULL, true, 'b64d182f-0ee3-40a0-b367-281f31902620', false, 'direct'),
	(7, '2025-10-31 05:32:42.717337+00', '2025-10-31 05:32:42.717337+00', NULL, NULL, NULL, '00000000-0000-0000-0000-000000000001', 1, 7, false, NULL, true, 'b64d182f-0ee3-40a0-b367-281f31902620', false, 'direct'),
	(8, '2025-10-31 05:32:42.717337+00', '2025-10-31 05:32:42.717337+00', NULL, NULL, NULL, '00000000-0000-0000-0000-000000000001', 1, 8, false, NULL, true, 'b64d182f-0ee3-40a0-b367-281f31902620', false, 'direct'),
	(9, '2025-10-31 05:32:42.717337+00', '2025-10-31 05:32:42.717337+00', NULL, NULL, NULL, '00000000-0000-0000-0000-000000000001', 1, 9, false, NULL, true, 'b64d182f-0ee3-40a0-b367-281f31902620', false, 'direct'),
	(10, '2025-10-31 05:32:42.717337+00', '2025-10-31 05:32:42.717337+00', NULL, NULL, NULL, '00000000-0000-0000-0000-000000000001', 1, 10, false, NULL, true, 'b64d182f-0ee3-40a0-b367-281f31902620', false, 'direct'),
	(11, '2025-10-31 05:32:42.717337+00', '2025-10-31 05:32:42.717337+00', NULL, NULL, NULL, '00000000-0000-0000-0000-000000000001', 1, 11, false, NULL, true, 'b64d182f-0ee3-40a0-b367-281f31902620', false, 'direct'),
	(12, '2025-10-31 05:32:51.593749+00', '2025-10-31 05:32:51.593749+00', NULL, NULL, NULL, '00000000-0000-0000-0000-000000000001', 2, 1, false, NULL, true, 'b64d182f-0ee3-40a0-b367-281f31902620', false, 'direct'),
	(13, '2025-10-31 05:32:51.593749+00', '2025-10-31 05:32:51.593749+00', NULL, NULL, NULL, '00000000-0000-0000-0000-000000000001', 2, 2, false, NULL, true, 'b64d182f-0ee3-40a0-b367-281f31902620', false, 'direct'),
	(14, '2025-10-31 05:32:51.593749+00', '2025-10-31 05:32:51.593749+00', NULL, NULL, NULL, '00000000-0000-0000-0000-000000000001', 2, 3, false, NULL, true, 'b64d182f-0ee3-40a0-b367-281f31902620', false, 'direct'),
	(15, '2025-10-31 05:32:51.593749+00', '2025-10-31 05:32:51.593749+00', NULL, NULL, NULL, '00000000-0000-0000-0000-000000000001', 2, 4, false, NULL, true, 'b64d182f-0ee3-40a0-b367-281f31902620', false, 'direct'),
	(16, '2025-10-31 05:32:51.593749+00', '2025-10-31 05:32:51.593749+00', NULL, NULL, NULL, '00000000-0000-0000-0000-000000000001', 2, 5, false, NULL, true, 'b64d182f-0ee3-40a0-b367-281f31902620', false, 'direct'),
	(17, '2025-10-31 05:32:51.593749+00', '2025-10-31 05:32:51.593749+00', NULL, NULL, NULL, '00000000-0000-0000-0000-000000000001', 2, 6, false, NULL, true, 'b64d182f-0ee3-40a0-b367-281f31902620', false, 'direct'),
	(18, '2025-10-31 05:32:51.593749+00', '2025-10-31 05:32:51.593749+00', NULL, NULL, NULL, '00000000-0000-0000-0000-000000000001', 2, 7, false, NULL, true, 'b64d182f-0ee3-40a0-b367-281f31902620', false, 'direct'),
	(19, '2025-10-31 05:32:51.593749+00', '2025-10-31 05:32:51.593749+00', NULL, NULL, NULL, '00000000-0000-0000-0000-000000000001', 2, 8, false, NULL, true, 'b64d182f-0ee3-40a0-b367-281f31902620', false, 'direct'),
	(20, '2025-10-31 05:32:51.593749+00', '2025-10-31 05:32:51.593749+00', NULL, NULL, NULL, '00000000-0000-0000-0000-000000000001', 2, 9, false, NULL, true, 'b64d182f-0ee3-40a0-b367-281f31902620', false, 'direct'),
	(21, '2025-10-31 05:32:51.593749+00', '2025-10-31 05:32:51.593749+00', NULL, NULL, NULL, '00000000-0000-0000-0000-000000000001', 2, 10, false, NULL, true, 'b64d182f-0ee3-40a0-b367-281f31902620', false, 'direct'),
	(22, '2025-10-31 05:32:51.593749+00', '2025-10-31 05:32:51.593749+00', NULL, NULL, NULL, '00000000-0000-0000-0000-000000000001', 2, 11, false, NULL, true, 'b64d182f-0ee3-40a0-b367-281f31902620', false, 'direct'),
	(23, '2025-10-31 08:11:45.338914+00', '2025-10-31 08:11:45.338914+00', NULL, NULL, NULL, '00000000-0000-0000-0000-000000000001', 3, 12, false, NULL, true, 'b64d182f-0ee3-40a0-b367-281f31902620', false, 'direct');


--
-- Data for Name: interview_evidence; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: interview_question_applicable_roles; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."interview_question_applicable_roles" ("id", "created_at", "interview_id", "questionnaire_question_id", "company_id", "role_id", "is_universal") VALUES
	(1, '2025-10-31 05:32:42.733736+00', 1, 1, 'b64d182f-0ee3-40a0-b367-281f31902620', 2, false),
	(2, '2025-10-31 05:32:42.733736+00', 1, 2, 'b64d182f-0ee3-40a0-b367-281f31902620', 2, false),
	(3, '2025-10-31 05:32:42.733736+00', 1, 3, 'b64d182f-0ee3-40a0-b367-281f31902620', 2, false),
	(4, '2025-10-31 05:32:42.733736+00', 1, 4, 'b64d182f-0ee3-40a0-b367-281f31902620', 2, false),
	(5, '2025-10-31 05:32:42.733736+00', 1, 5, 'b64d182f-0ee3-40a0-b367-281f31902620', 2, false),
	(6, '2025-10-31 05:32:42.733736+00', 1, 6, 'b64d182f-0ee3-40a0-b367-281f31902620', 2, false),
	(7, '2025-10-31 05:32:42.733736+00', 1, 7, 'b64d182f-0ee3-40a0-b367-281f31902620', 2, false),
	(8, '2025-10-31 05:32:42.733736+00', 1, 8, 'b64d182f-0ee3-40a0-b367-281f31902620', 2, false),
	(9, '2025-10-31 05:32:42.733736+00', 1, 9, 'b64d182f-0ee3-40a0-b367-281f31902620', 2, false),
	(10, '2025-10-31 05:32:42.733736+00', 1, 10, 'b64d182f-0ee3-40a0-b367-281f31902620', 2, false),
	(11, '2025-10-31 05:32:42.733736+00', 1, 11, 'b64d182f-0ee3-40a0-b367-281f31902620', 2, false),
	(12, '2025-10-31 05:32:51.608212+00', 2, 1, 'b64d182f-0ee3-40a0-b367-281f31902620', 2, false),
	(13, '2025-10-31 05:32:51.608212+00', 2, 2, 'b64d182f-0ee3-40a0-b367-281f31902620', 2, false),
	(14, '2025-10-31 05:32:51.608212+00', 2, 3, 'b64d182f-0ee3-40a0-b367-281f31902620', 2, false),
	(15, '2025-10-31 05:32:51.608212+00', 2, 4, 'b64d182f-0ee3-40a0-b367-281f31902620', 2, false),
	(16, '2025-10-31 05:32:51.608212+00', 2, 5, 'b64d182f-0ee3-40a0-b367-281f31902620', 2, false),
	(17, '2025-10-31 05:32:51.608212+00', 2, 6, 'b64d182f-0ee3-40a0-b367-281f31902620', 2, false),
	(18, '2025-10-31 05:32:51.608212+00', 2, 7, 'b64d182f-0ee3-40a0-b367-281f31902620', 2, false),
	(19, '2025-10-31 05:32:51.608212+00', 2, 8, 'b64d182f-0ee3-40a0-b367-281f31902620', 2, false),
	(20, '2025-10-31 05:32:51.608212+00', 2, 9, 'b64d182f-0ee3-40a0-b367-281f31902620', 2, false),
	(21, '2025-10-31 05:32:51.608212+00', 2, 10, 'b64d182f-0ee3-40a0-b367-281f31902620', 2, false),
	(22, '2025-10-31 05:32:51.608212+00', 2, 11, 'b64d182f-0ee3-40a0-b367-281f31902620', 2, false),
	(23, '2025-10-31 08:11:45.353003+00', 3, 12, 'b64d182f-0ee3-40a0-b367-281f31902620', NULL, true);


--
-- Data for Name: questionnaire_question_parts; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."questionnaire_question_parts" ("id", "created_at", "updated_at", "created_by", "deleted_at", "is_deleted", "text", "order_index", "answer_type", "options", "company_id", "questionnaire_question_id") VALUES
	(1, '2025-10-31 03:49:17.10868+00', '2025-10-31 03:49:17.10868+00', '00000000-0000-0000-0000-000000000001', NULL, false, 'Current backlog size (number of work orders)', 0, 'scale', '{"max": 250, "min": 0, "step": 25}', 'b64d182f-0ee3-40a0-b367-281f31902620', 1),
	(2, '2025-10-31 03:49:54.20195+00', '2025-10-31 03:49:54.20195+00', '00000000-0000-0000-0000-000000000001', NULL, false, 'Percentage of planned vs reactive work this week', 1, 'percentage', '{}', 'b64d182f-0ee3-40a0-b367-281f31902620', 1),
	(3, '2025-10-31 03:50:03.462367+00', '2025-10-31 03:51:23.171+00', '00000000-0000-0000-0000-000000000001', NULL, false, 'Confidence level in meeting this week''s schedule', 2, 'scale', '{"max": 5, "min": 1, "step": 1}', 'b64d182f-0ee3-40a0-b367-281f31902620', 1),
	(4, '2025-10-31 04:02:03.562196+00', '2025-10-31 04:02:03.562196+00', '00000000-0000-0000-0000-000000000001', NULL, false, 'Primary bottleneck encountered', 0, 'labelled_scale', '{"labels": ["None", "Labor availability", "Parts/Materials", "Equipment access", "Permit/Documentation", "Weather", "Other"]}', 'b64d182f-0ee3-40a0-b367-281f31902620', 2),
	(5, '2025-10-31 04:02:19.767275+00', '2025-10-31 04:02:19.767275+00', '00000000-0000-0000-0000-000000000001', NULL, false, 'Estimated hours lost to scheduling conflicts', 1, 'number', '{"max": 100, "min": 0, "decimal_places": 1}', 'b64d182f-0ee3-40a0-b367-281f31902620', 2),
	(6, '2025-10-31 04:02:37.010725+00', '2025-10-31 04:02:37.010725+00', '00000000-0000-0000-0000-000000000001', NULL, false, 'Percentage of jobs completed as planned', 0, 'percentage', '{}', 'b64d182f-0ee3-40a0-b367-281f31902620', 3),
	(7, '2025-10-31 04:02:46.293277+00', '2025-10-31 04:02:46.293277+00', '00000000-0000-0000-0000-000000000001', NULL, false, 'Number of jobs requiring re-planning', 1, 'number', '{"max": 999, "min": 0, "decimal_places": 0}', 'b64d182f-0ee3-40a0-b367-281f31902620', 3),
	(8, '2025-10-31 04:02:55.213117+00', '2025-10-31 04:02:55.213117+00', '00000000-0000-0000-0000-000000000001', NULL, false, 'Average planning accuracy score (self-assessed)', 2, 'scale', '{"max": 5, "min": 1, "step": 1}', 'b64d182f-0ee3-40a0-b367-281f31902620', 3),
	(9, '2025-10-31 04:03:11.804415+00', '2025-10-31 04:03:11.804415+00', '00000000-0000-0000-0000-000000000001', NULL, false, 'Labor availability vs requirements (percentage match)', 0, 'percentage', '{}', 'b64d182f-0ee3-40a0-b367-281f31902620', 4),
	(10, '2025-10-31 04:03:23.404507+00', '2025-10-31 04:03:23.404507+00', '00000000-0000-0000-0000-000000000001', NULL, false, 'Materials/parts availability issues (count)', 1, 'number', '{"max": 99, "min": 0, "decimal_places": 0}', 'b64d182f-0ee3-40a0-b367-281f31902620', 4),
	(11, '2025-10-31 04:03:35.888755+00', '2025-10-31 04:03:35.888755+00', '00000000-0000-0000-0000-000000000001', NULL, false, 'Equipment/tool conflicts experienced', 2, 'number', '{"max": 99, "min": 0, "decimal_places": 0}', 'b64d182f-0ee3-40a0-b367-281f31902620', 4),
	(12, '2025-10-31 04:03:56.187268+00', '2025-10-31 04:03:56.187268+00', '00000000-0000-0000-0000-000000000001', NULL, false, 'Number of contractor delays', 0, 'number', '{"max": 99, "min": 0, "decimal_places": 0}', 'b64d182f-0ee3-40a0-b367-281f31902620', 5),
	(13, '2025-10-31 04:04:02.00272+00', '2025-10-31 04:04:02.00272+00', '00000000-0000-0000-0000-000000000001', NULL, false, 'Communication effectiveness', 1, 'scale', '{"max": 5, "min": 1, "step": 1}', 'b64d182f-0ee3-40a0-b367-281f31902620', 5),
	(14, '2025-10-31 04:04:14.985658+00', '2025-10-31 04:04:14.985658+00', '00000000-0000-0000-0000-000000000001', NULL, false, 'Number of permits successfully coordinated', 0, 'number', '{"max": 999, "min": 0, "decimal_places": 0}', 'b64d182f-0ee3-40a0-b367-281f31902620', 6),
	(15, '2025-10-31 04:04:21.354122+00', '2025-10-31 04:04:21.354122+00', '00000000-0000-0000-0000-000000000001', NULL, false, 'Any safety concerns raised but unresolved', 1, 'boolean', '{}', 'b64d182f-0ee3-40a0-b367-281f31902620', 6),
	(16, '2025-10-31 04:04:29.535367+00', '2025-10-31 04:04:29.535367+00', '00000000-0000-0000-0000-000000000001', NULL, false, 'Compliance documentation completeness', 2, 'percentage', '{}', 'b64d182f-0ee3-40a0-b367-281f31902620', 6),
	(17, '2025-10-31 04:04:39.466862+00', '2025-10-31 04:04:39.466862+00', '00000000-0000-0000-0000-000000000001', NULL, false, 'Percentage of time allocated to critical equipment', 0, 'percentage', '{}', 'b64d182f-0ee3-40a0-b367-281f31902620', 7),
	(18, '2025-10-31 04:04:44.384883+00', '2025-10-31 04:04:44.384883+00', '00000000-0000-0000-0000-000000000001', NULL, false, 'Any critical work deferred', 1, 'boolean', '{}', 'b64d182f-0ee3-40a0-b367-281f31902620', 7),
	(19, '2025-10-31 04:05:00.070861+00', '2025-10-31 04:05:00.070861+00', '00000000-0000-0000-0000-000000000001', NULL, false, 'Operations coordination satisfaction', 0, 'scale', '{"max": 5, "min": 1, "step": 1}', 'b64d182f-0ee3-40a0-b367-281f31902620', 8),
	(20, '2025-10-31 04:05:08.456607+00', '2025-10-31 04:05:08.456607+00', '00000000-0000-0000-0000-000000000001', NULL, false, 'Maintenance crew feedback quality', 1, 'scale', '{"max": 5, "min": 1, "step": 1}', 'b64d182f-0ee3-40a0-b367-281f31902620', 8),
	(21, '2025-10-31 04:05:17.102691+00', '2025-10-31 04:05:17.102691+00', '00000000-0000-0000-0000-000000000001', NULL, false, 'Number of escalations required', 2, 'number', '{"max": 99, "min": 0, "decimal_places": 0}', 'b64d182f-0ee3-40a0-b367-281f31902620', 8),
	(22, '2025-10-31 04:05:27.806915+00', '2025-10-31 04:05:27.806915+00', '00000000-0000-0000-0000-000000000001', NULL, false, 'CMMS/planning software performance', 0, 'scale', '{"max": 5, "min": 1, "step": 1}', 'b64d182f-0ee3-40a0-b367-281f31902620', 9),
	(23, '2025-10-31 04:05:39.548774+00', '2025-10-31 04:05:39.548774+00', '00000000-0000-0000-0000-000000000001', NULL, false, 'Data quality issues encountered', 1, 'number', '{"max": 99, "min": 0, "decimal_places": 0}', 'b64d182f-0ee3-40a0-b367-281f31902620', 9),
	(24, '2025-10-31 04:06:27.04411+00', '2025-10-31 04:06:27.04411+00', '00000000-0000-0000-0000-000000000001', NULL, false, 'Top improvement area', 0, 'labelled_scale', '{"labels": ["None identified", "Process/Workflow", "Systems/Tools", "Communication", "Training/Skills", "Resources", "Documentation", "Other"]}', 'b64d182f-0ee3-40a0-b367-281f31902620', 10),
	(25, '2025-10-31 04:06:42.160884+00', '2025-10-31 04:06:42.160884+00', '00000000-0000-0000-0000-000000000001', NULL, false, 'Estimated time savings if implemented (hours/week)', 1, 'number', '{"max": 40, "min": 0, "decimal_places": 1}', 'b64d182f-0ee3-40a0-b367-281f31902620', 10),
	(26, '2025-10-31 04:06:53.744761+00', '2025-10-31 04:06:53.744761+00', '00000000-0000-0000-0000-000000000001', NULL, false, 'Percentage of next week''s work already planned', 0, 'percentage', '{}', 'b64d182f-0ee3-40a0-b367-281f31902620', 11),
	(27, '2025-10-31 04:07:27.53831+00', '2025-10-31 04:07:27.53831+00', '00000000-0000-0000-0000-000000000001', NULL, false, 'Risk level for next week', 1, 'labelled_scale', '{"labels": ["Low - Well controlled", "Medium - Some concerns", "High - Significant challenges", "Critical - Major issues expected"]}', 'b64d182f-0ee3-40a0-b367-281f31902620', 11),
	(28, '2025-10-31 04:08:07.273655+00', '2025-10-31 04:08:07.273655+00', '00000000-0000-0000-0000-000000000001', NULL, false, 'Management support needed', 2, 'labelled_scale', '{"labels": ["None needed", "Resource allocation", "Priority clarification", "System/tool issues", "Stakeholder alignment", "Training/guidance", "Other"]}', 'b64d182f-0ee3-40a0-b367-281f31902620', 11),
	(29, '2025-10-31 08:03:02.3018+00', '2025-10-31 08:03:02.3018+00', '00000000-0000-0000-0000-000000000001', NULL, false, 'Does this work?', 0, 'boolean', '{}', 'b64d182f-0ee3-40a0-b367-281f31902620', 12),
	(30, '2025-10-31 08:03:10.237225+00', '2025-10-31 08:03:10.237225+00', '00000000-0000-0000-0000-000000000001', NULL, false, 'How well does this work?', 1, 'scale', '{"max": 5, "min": 1, "step": 1}', 'b64d182f-0ee3-40a0-b367-281f31902620', 12),
	(31, '2025-10-31 08:03:27.314826+00', '2025-10-31 08:03:27.314826+00', '00000000-0000-0000-0000-000000000001', NULL, false, 'Is this working correctly?', 2, 'labelled_scale', '{"labels": ["No", "Partially", "Yes"]}', 'b64d182f-0ee3-40a0-b367-281f31902620', 12),
	(32, '2025-10-31 08:03:48.747381+00', '2025-10-31 08:03:48.747381+00', '00000000-0000-0000-0000-000000000001', NULL, false, 'How much of this is working?', 3, 'percentage', '{}', 'b64d182f-0ee3-40a0-b367-281f31902620', 12),
	(33, '2025-10-31 08:04:15.670946+00', '2025-10-31 08:04:15.670946+00', '00000000-0000-0000-0000-000000000001', NULL, false, 'How many questions do you need to answer?', 4, 'number', '{"max": 10, "min": 1, "decimal_places": 0}', 'b64d182f-0ee3-40a0-b367-281f31902620', 12);


--
-- Data for Name: interview_question_part_responses; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: interview_response_actions; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: interview_response_roles; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."interview_response_roles" ("id", "created_at", "updated_at", "created_by", "role_id", "interview_response_id", "company_id", "interview_id") VALUES
	(1, '2025-10-31 05:32:42.748974+00', '2025-10-31 05:32:42.748974+00', '00000000-0000-0000-0000-000000000001', 2, 1, 'b64d182f-0ee3-40a0-b367-281f31902620', 1),
	(2, '2025-10-31 05:32:42.748974+00', '2025-10-31 05:32:42.748974+00', '00000000-0000-0000-0000-000000000001', 2, 2, 'b64d182f-0ee3-40a0-b367-281f31902620', 1),
	(3, '2025-10-31 05:32:42.748974+00', '2025-10-31 05:32:42.748974+00', '00000000-0000-0000-0000-000000000001', 2, 3, 'b64d182f-0ee3-40a0-b367-281f31902620', 1),
	(4, '2025-10-31 05:32:42.748974+00', '2025-10-31 05:32:42.748974+00', '00000000-0000-0000-0000-000000000001', 2, 4, 'b64d182f-0ee3-40a0-b367-281f31902620', 1),
	(5, '2025-10-31 05:32:42.748974+00', '2025-10-31 05:32:42.748974+00', '00000000-0000-0000-0000-000000000001', 2, 5, 'b64d182f-0ee3-40a0-b367-281f31902620', 1),
	(6, '2025-10-31 05:32:42.748974+00', '2025-10-31 05:32:42.748974+00', '00000000-0000-0000-0000-000000000001', 2, 6, 'b64d182f-0ee3-40a0-b367-281f31902620', 1),
	(7, '2025-10-31 05:32:42.748974+00', '2025-10-31 05:32:42.748974+00', '00000000-0000-0000-0000-000000000001', 2, 7, 'b64d182f-0ee3-40a0-b367-281f31902620', 1),
	(8, '2025-10-31 05:32:42.748974+00', '2025-10-31 05:32:42.748974+00', '00000000-0000-0000-0000-000000000001', 2, 8, 'b64d182f-0ee3-40a0-b367-281f31902620', 1),
	(9, '2025-10-31 05:32:42.748974+00', '2025-10-31 05:32:42.748974+00', '00000000-0000-0000-0000-000000000001', 2, 9, 'b64d182f-0ee3-40a0-b367-281f31902620', 1),
	(10, '2025-10-31 05:32:42.748974+00', '2025-10-31 05:32:42.748974+00', '00000000-0000-0000-0000-000000000001', 2, 10, 'b64d182f-0ee3-40a0-b367-281f31902620', 1),
	(11, '2025-10-31 05:32:42.748974+00', '2025-10-31 05:32:42.748974+00', '00000000-0000-0000-0000-000000000001', 2, 11, 'b64d182f-0ee3-40a0-b367-281f31902620', 1),
	(12, '2025-10-31 08:11:45.364958+00', '2025-10-31 08:11:45.364958+00', '00000000-0000-0000-0000-000000000001', 7, 23, 'b64d182f-0ee3-40a0-b367-281f31902620', 3);


--
-- Data for Name: interview_roles; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."interview_roles" ("id", "created_at", "created_by", "interview_id", "role_id", "company_id") VALUES
	(1, '2025-10-31 05:32:42.700906+00', '00000000-0000-0000-0000-000000000001', 1, 2, 'b64d182f-0ee3-40a0-b367-281f31902620'),
	(2, '2025-10-31 05:32:51.577914+00', '00000000-0000-0000-0000-000000000001', 2, 1, 'b64d182f-0ee3-40a0-b367-281f31902620'),
	(3, '2025-10-31 05:32:51.577914+00', '00000000-0000-0000-0000-000000000001', 2, 2, 'b64d182f-0ee3-40a0-b367-281f31902620'),
	(4, '2025-10-31 05:32:51.577914+00', '00000000-0000-0000-0000-000000000001', 2, 3, 'b64d182f-0ee3-40a0-b367-281f31902620'),
	(5, '2025-10-31 05:32:51.577914+00', '00000000-0000-0000-0000-000000000001', 2, 7, 'b64d182f-0ee3-40a0-b367-281f31902620'),
	(6, '2025-10-31 08:11:45.326705+00', '00000000-0000-0000-0000-000000000001', 3, 7, 'b64d182f-0ee3-40a0-b367-281f31902620');


--
-- Data for Name: measurement_alignments; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: measurement_definitions; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."measurement_definitions" ("id", "created_at", "updated_at", "name", "description", "calculation_type", "provider", "objective", "calculation", "required_csv_columns", "unit", "min_value", "max_value", "active", "is_deleted", "deleted_at") VALUES
	(36, '2025-09-08 04:19:48.091485+00', '2025-09-08 04:19:48.091485+00', 'Task List Usage', 'Total Work orders completed in previous 12 months that has utilised a task list for work planning over the same period.', 'ratio', 'SAP', 'To view the percentage of completed work orders which had a Task List attached. A large percentage of work orders with Task Lists attached indicates that Work Management can produce quality work orders with predetermined resources, materials and documents.', 'Task List Utilisation = All completed Work Orders / All completed Work Orders with Task List', '[{"name": "completion_date", "data_type": "date", "description": null}, {"name": "task_list_id", "data_type": "string", "description": null}, {"name": "work_order_id", "data_type": "string", "description": null}]', NULL, NULL, NULL, true, false, NULL),
	(37, '2025-09-08 04:19:48.403232+00', '2025-09-08 04:19:48.403232+00', 'Available Capacity Hours', 'Total maintenance capacity availability by week from current schedule week to future 26 weeks.', 'sum', 'SAP', 'To view available capacity hours by maintenance work centre, providing a forward-looking snapshot of available capacity.', NULL, NULL, NULL, NULL, NULL, true, false, NULL),
	(38, '2025-09-08 04:19:48.757724+00', '2025-09-08 04:19:48.757724+00', 'Notification Turnover', 'A ratio of all notifications converted to a work order in less than 24 hours over all notifications.', 'ratio', 'SAP', 'To view the effectiveness of managing notifications and when they are reviewed.', 'Notification Turnover = All Notifications Converted to Work Orders in under 24 Hours / All Notifications', '[{"name": "creation_date", "data_type": "date", "description": null}, {"name": "notification_id", "data_type": "string", "description": null}, {"name": "work_order_creation_date", "data_type": "date", "description": null}]', NULL, NULL, NULL, true, false, NULL),
	(39, '2025-09-08 04:19:49.060908+00', '2025-09-08 04:19:49.060908+00', 'Task List Materials Usage (Manual DIFOT)', 'A ratio of task lists with materials on them measured against all task lists used on closed work orders.', 'ratio', 'SAP', 'To view the use of task lists with materials that enable effective execution of planned maintenance work and takes into consideration the implications of likely break-in work.', 'Task List Materials Usage = Work Orders Closed with Materials from Task Lists / All Work Orders Closed with Task Lists', '[{"name": "material_id", "data_type": "string", "description": null}, {"name": "task_list_id", "data_type": "string", "description": null}, {"name": "work_order_id", "data_type": "string", "description": null}, {"name": "work_order_status", "data_type": "string", "description": null}]', NULL, NULL, NULL, false, false, NULL),
	(40, '2025-09-08 04:19:49.371284+00', '2025-09-08 04:19:49.371284+00', 'Notification Close Out Quality', 'A ratio of all completed quality work orders/notifications against all work orders. A quality notification closed is when all the below criteria is completed:\nDamage Code\nCause Code\nSystem Code\nComponent Code', 'ratio', 'SAP', 'To view the percentage of notifications completed with all required information. Accurate recording of maintenance history enables analysis for productivity and efficiency improvements.', 'Notification Close Out Quality = Quality Closed Out Notifications / All Notifications Closed', '[{"name": "cause_code", "data_type": "string", "description": null}, {"name": "component_code", "data_type": "string", "description": null}, {"name": "damage_code", "data_type": "string", "description": null}, {"name": "notification_id", "data_type": "string", "description": null}, {"name": "notification_status", "data_type": "string", "description": null}, {"name": "system_code", "data_type": "string", "description": null}, {"name": "work_order_status", "data_type": "string", "description": null}]', NULL, NULL, NULL, false, false, NULL),
	(41, '2025-09-08 04:19:49.664696+00', '2025-09-08 04:19:49.664696+00', 'Workload Control (Manual)', 'A ratio of all planned work orders against all work orders. A planned work order is when the work order has a revision set against it.', 'ratio', 'SAP', 'To view pending planned work. Workload Control is maintained to assist with budgeting and co-ordinating of major maintenance and other significant events affecting Operations planning.', 'Workload Control = All Planned Work Orders / All Work Orders', '[{"name": "revision", "data_type": "string", "description": null}, {"name": "work_order_id", "data_type": "string", "description": null}, {"name": "work_order_status", "data_type": "string", "description": null}]', NULL, NULL, NULL, false, false, NULL),
	(42, '2025-09-08 04:19:49.957083+00', '2025-09-08 04:19:49.957083+00', 'Asset Not Available Reschedule Work', 'A ratio of all rescheduled work orders with status RSAU against all work orders.', 'ratio', 'SAP', 'To view the impact to planned schedule work/compliance due to assets not arriving when requested. It allows us to gain an appreciation of the magnitude of adherence to Schedule.', 'Asset Not Available Reschedule Work = All Rescheduled Work Orders with Status RSAU / All Work Orders', '[{"name": "reschedule_status", "data_type": "string", "description": null}, {"name": "work_order_id", "data_type": "string", "description": null}, {"name": "work_order_status", "data_type": "string", "description": null}]', NULL, NULL, NULL, false, false, NULL),
	(43, '2025-09-08 04:19:50.253194+00', '2025-09-08 04:19:50.253194+00', 'Schedule Compliant', 'The percentage of the scheduled work that was completed in the last 12 months. Work Order measure by count of work orders completed. Scheduled work is all work orders in the current week with a revision assigned.', 'ratio', 'SAP', 'To view the effectiveness of the scheduling process and completion of work for the schedule period', 'Schedule Compliant = All Work Orders Completed / All Scheduled Work Orders', '[{"name": "completion_date", "data_type": "date", "description": null}, {"name": "revision", "data_type": "string", "description": null}, {"name": "scheduled_start_date", "data_type": "date", "description": null}, {"name": "work_order_id", "data_type": "string", "description": null}, {"name": "work_order_status", "data_type": "string", "description": null}]', NULL, NULL, NULL, false, false, NULL),
	(44, '2025-09-08 04:19:50.546412+00', '2025-09-08 04:19:50.546412+00', 'Preventive Work Effectiveness', 'The percentage of corrective work with status FOO, identified from scheduled preventative and corrective work measured over all closed work orders in the last 12 months. Work orders are a measure by count.', 'ratio', 'SAP', 'To view the effectiveness of scheduled preventative and corrective work in identifying corrective work to ensure the asset can be utilised between maintenance periods and break-in work is minimised.', 'Preventative Work Effectiveness = All Corrective Work Orders with Status FOO from Scheduled Work / All Work Orders Closed', '[{"name": "completion_date", "data_type": "date", "description": null}, {"name": "work_order_id", "data_type": "string", "description": null}, {"name": "work_order_status", "data_type": "string", "description": null}, {"name": "work_order_type", "data_type": "string", "description": null}]', NULL, NULL, NULL, false, false, NULL),
	(45, '2025-09-08 04:19:50.855791+00', '2025-09-08 04:19:50.855791+00', 'Asset Handover Effectiveness (Future)', 'Asset Handover Effectiveness is defined as the percentage of calendar time that the asset was not operating before maintenance begun', 'ratio', 'other', 'To view the time that the asset is idol, albeit productively or non-productively. It provides an overall measure of how well delivery of the Asset and handover is done between Maintenance and Operations.', 'Asset Handover Effectiveness = Asset Handover Time / Total of Asset Handover and Maintenance Downtime Time', '[{"name": "asset_id", "data_type": "string", "description": null}, {"name": "handover_start_time", "data_type": "date", "description": null}, {"name": "maintenance_end_time", "data_type": "date", "description": null}, {"name": "maintenance_start_time", "data_type": "date", "description": null}]', NULL, NULL, NULL, false, false, NULL),
	(46, '2025-09-08 04:19:51.186154+00', '2025-09-08 04:19:51.186154+00', 'Asset Condition', 'The amount of time an asset has a status code applied to it measured as a percentage of all time by code type.', 'ratio', 'other', 'To view the condition of the Asset using the Status Code for effective prioritisation and planning of Operations and Maintenance tasks.', 'Asset Condition For Each Status Code = Time in Code / All Time', '[{"name": "asset_id", "data_type": "string", "description": null}, {"name": "status_code", "data_type": "string", "description": null}, {"name": "status_end_date", "data_type": "date", "description": null}, {"name": "status_start_date", "data_type": "date", "description": null}]', NULL, NULL, NULL, false, false, NULL),
	(47, '2025-09-08 04:19:51.449671+00', '2025-09-08 04:19:51.449671+00', 'Unplanned Work Orders (Manual)', 'A summation count of all work orders not planned in back and forward scheduling periods divided by the summation count of all work orders grouped by the work order start date.', 'ratio', 'SAP', 'To view total amount of work orders that are not planned ready for scheduling and execution. It indicates how effectively Maintenance is keeping up with the volume of work being generated with the resources available.', 'Unplanned Work Orders = Unplanned Work Orders / All Work Orders', '[{"name": "revision", "data_type": "string", "description": null}, {"name": "work_order_id", "data_type": "string", "description": null}, {"name": "work_order_start_date", "data_type": "date", "description": null}, {"name": "work_order_status", "data_type": "string", "description": null}]', NULL, NULL, NULL, false, false, NULL),
	(48, '2025-09-08 04:19:51.7407+00', '2025-09-08 04:19:51.7407+00', 'Notification Priority Age', 'A summation of notifications age per priority type divided by the count of notifications per priority type.', 'average', 'SAP', 'To understand the assessment of notification priorities and to how well we are managing the workload. Priorities of work being performed must be determined based on set guidelines and in line with maintenance and operation requirements.', 'Notification Priority = Total Notification Age by Priority / Count of Notifications by Priority', '[{"name": "close_date", "data_type": "date", "description": null}, {"name": "creation_date", "data_type": "date", "description": null}, {"name": "notification_id", "data_type": "string", "description": null}, {"name": "priority", "data_type": "string", "description": null}]', NULL, NULL, NULL, false, false, NULL),
	(49, '2025-09-08 04:19:52.047271+00', '2025-09-08 04:19:52.047271+00', 'Work Order Priority Age', 'A summation of work orders age per priority type divided by the count of work orders per priority type.', 'average', 'SAP', 'To view how prioritisation of work for planning and scheduling is completed using work order priorities and to observe how well we are managing the workload. Priorities of work being performed must be determined based on set guidelines and in line with maintenance and operation requirements.', 'Work Order Priority = Total Work Order Age by Priority / Count of Work Orders by Priority', '[{"name": "close_date", "data_type": "date", "description": null}, {"name": "creation_date", "data_type": "date", "description": null}, {"name": "priority", "data_type": "string", "description": null}, {"name": "work_order_id", "data_type": "string", "description": null}]', NULL, NULL, NULL, false, false, NULL),
	(50, '2025-09-08 04:19:52.376834+00', '2025-09-08 04:19:52.376834+00', 'Rework (Future)', 'A notification raised by RDC within 5 days after depot maintenance, measured across all notifications raised, is an indication our maintenance is not being carried out with quality checks.', 'ratio', 'SAP', 'To view the effectiveness and quality of how we executed work during the planned and scheduled period. With quality assurance checks we control the risk of re-work, which is a source of waste and risk of unnecessary downtime/failure.', 'Rework = M2 Notifications by RDC <= 5 Days / All M2 Notifications', '[{"name": "notification_creation_date", "data_type": "date", "description": null}, {"name": "notification_id", "data_type": "string", "description": null}, {"name": "work_order_completion_date", "data_type": "date", "description": null}, {"name": "work_order_id", "data_type": "string", "description": null}]', NULL, NULL, NULL, false, false, NULL),
	(51, '2025-09-08 04:19:52.670788+00', '2025-09-08 04:19:52.670788+00', 'Planned Equipment Availability (Future)', 'The percentage of calendar time that assets are physically available for work. Calendar time 1440 mins per day and all measurements are to be taken over same period', 'ratio', 'other', 'To view how maintenance work in the future integrates with the operation plans which is reflected by predicting availability of equipment after scheduled maintenance.', 'Equipment Availability = (Calendar Time - Total Hours Future Work Orders) / Calendar Time', '[{"name": "asset_id", "data_type": "string", "description": null}, {"name": "calendar_time", "data_type": "number", "description": null}, {"name": "total_hours_future_work_orders", "data_type": "number", "description": null}]', NULL, NULL, NULL, false, false, NULL),
	(52, '2025-09-08 04:19:52.924363+00', '2025-09-08 04:19:52.924363+00', 'Break-In Work Ratio', 'The ratio of the break-in maintenance work to the total maintenance work based on work order count calculated over the same period.', 'ratio', 'SAP', 'The break-in work ratio measures the distribution of the maintenance work by showing the type of work that maintenance resources are executing.', 'Break-In Work Ratio = Total Number of Break-In Work Orders Completed / Total Number of Work Orders Completed', '[{"name": "completion_date", "data_type": "date", "description": null}, {"name": "work_order_id", "data_type": "string", "description": null}, {"name": "work_order_status", "data_type": "string", "description": null}, {"name": "work_order_type", "data_type": "string", "description": null}]', NULL, NULL, NULL, true, false, NULL),
	(53, '2025-09-08 04:19:53.222016+00', '2025-09-08 04:19:53.222016+00', 'Scheduled Loading', 'It is defined as the percentage of total estimated work hours on scheduled work orders for the scheduling period compared to total available manhours for the scheduling period.', 'ratio', 'SAP', 'To view planned utilisation of labour on scheduled work compared to all labour available and the effective use of the work order management system in managing labour.', 'Schedule Loading = Total Estimated Work Hours / Total Work Hours Available', '[{"name": "estimated_work_hours", "data_type": "number", "description": null}, {"name": "scheduled_end_date", "data_type": "date", "description": null}, {"name": "scheduled_start_date", "data_type": "date", "description": null}, {"name": "total_work_hours_available", "data_type": "number", "description": null}, {"name": "work_order_id", "data_type": "string", "description": null}]', NULL, NULL, NULL, false, false, NULL),
	(54, '2025-09-08 04:19:53.550942+00', '2025-09-08 04:19:53.550942+00', 'Material Demand Forecast (Future)', 'The percentage of materials that are ordered with a requirement date compared to the expected delivery time. Materials are measured as a count.', 'ratio', 'other', 'To view inventory effectiveness with demand forecasting.', 'Material Demand Forecast = Total Materials meet Forecast Date / Total All Materials', '[{"name": "delivery_date", "data_type": "date", "description": null}, {"name": "forecast_date", "data_type": "date", "description": null}, {"name": "material_id", "data_type": "string", "description": null}, {"name": "order_date", "data_type": "date", "description": null}]', NULL, NULL, NULL, false, false, NULL),
	(55, '2025-09-08 04:19:53.858233+00', '2025-09-08 04:19:53.858233+00', 'Corrective Work Task List Usage (Manual)', 'A ratio of corrective work orders with task list on them measured against all corrective work orders.', 'ratio', 'SAP', 'To view whether task lists are used on corrective work orders that enable effective execution of planned maintenance work.', 'Corrective Work Task List Usage = Corrective Work Orders Closed with Task Lists / All Corrective Work Orders Closed', '[{"name": "task_list_id", "data_type": "string", "description": null}, {"name": "work_order_id", "data_type": "string", "description": null}, {"name": "work_order_status", "data_type": "string", "description": null}, {"name": "work_order_type", "data_type": "string", "description": null}]', NULL, NULL, NULL, false, false, NULL),
	(56, '2025-09-08 04:19:54.156811+00', '2025-09-08 04:19:54.156811+00', 'Preventive Work Profile', 'Preventative work orders measured against total of all Preventative and Corrective work orders over a period. Period will be measured over the same time frame', 'ratio', 'SAP', 'To view the ratio of Preventative work against Corrective work. It provides an indication of how much work is proactive and scheduled to assure Asset capability.', 'Preventative Schedule Work = Preventative Work Orders / All Work Orders', '[{"name": "completion_date", "data_type": "date", "description": null}, {"name": "work_order_id", "data_type": "string", "description": null}, {"name": "work_order_status", "data_type": "string", "description": null}, {"name": "work_order_type", "data_type": "string", "description": null}]', NULL, NULL, NULL, false, false, NULL),
	(57, '2025-09-08 04:19:54.450173+00', '2025-09-08 04:19:54.450173+00', 'On Time Material Delivery (Manual DIFOT)', 'Materials required ordered date is compared to the actual delivery time and measured as a percentage that meet the required date.', 'ratio', 'SAP', 'To view inventory efficiency for delivery of materials when required for maintenance. It is an indicator of how supply is meeting maintenance demand in terms of the requested delivery date.', 'On Time Material Delivery = Total Materials Meet Required Date / Total All Materials', '[{"name": "delivery_date", "data_type": "date", "description": null}, {"name": "material_id", "data_type": "string", "description": null}, {"name": "required_date", "data_type": "date", "description": null}]', NULL, NULL, NULL, false, false, NULL),
	(58, '2025-09-08 04:19:54.737611+00', '2025-09-08 04:19:54.737611+00', 'Effective Labour Rate', 'The total of all direct and indirect labour costs is divided by all work order hours confirmed over the same period.', 'average', 'SAP', 'To view the effect of internal labour cost per hour for maintenance work and to benchmark this across depots and compare against budget.', 'Effective Labour Rate = Total All Costs / Total All Time Confirmations', '[{"name": "completion_date", "data_type": "date", "description": null}, {"name": "labour_cost", "data_type": "number", "description": null}, {"name": "time_confirmation_hours", "data_type": "number", "description": null}, {"name": "work_order_id", "data_type": "string", "description": null}]', NULL, NULL, NULL, false, false, NULL),
	(59, '2025-09-08 04:19:54.997859+00', '2025-09-08 04:19:54.997859+00', 'Material Management (Future)', 'All work orders with a return material movement on a work order captures the date the material was returned compared to the work order completion and then averaged in days.', 'average', 'SAP', 'To view the effectiveness and management of materials not used on work orders through the timeliness for return.', 'Material Management = Sum(Return Material Date - Work Order Completion Date) / Total Count Material Returns', '[{"name": "completion_date", "data_type": "date", "description": null}, {"name": "return_material_date", "data_type": "date", "description": null}, {"name": "work_order_id", "data_type": "string", "description": null}]', NULL, NULL, NULL, false, false, NULL),
	(60, '2025-09-08 04:19:55.288649+00', '2025-09-08 04:19:55.288649+00', 'Labour Wait Time (Manual)', 'Capture total time confirmations from standing work orders that have text reference “delayed due to operations” divided by all time confirmations to provide a percentage of time spent waiting.', 'ratio', 'SAP', 'To view the time spent by maintenance personnel waiting for assets to be delivered for scheduled maintenance.', 'Labour Wait Time = Total Hours Time Confirmations for Waiting / Total All Time Confirmations', '[{"name": "completion_date", "data_type": "date", "description": null}, {"name": "time_confirmation_hours", "data_type": "number", "description": null}, {"name": "work_order_id", "data_type": "string", "description": null}, {"name": "work_order_text", "data_type": "string", "description": null}]', NULL, NULL, NULL, false, false, NULL),
	(61, '2025-09-08 04:19:55.592948+00', '2025-09-08 04:19:55.592948+00', 'Labour Estimate Accuracy', 'A ratio of the sum of actual labour hours for all work order operations completed for that period to the sum of planned labour hours for all work order operations completed – expressed as a percentage.', 'ratio', 'SAP', 'To view the accuracy of the work order planning and scheduling function and the effectiveness of the work order feedback process.', 'Labour Estimate Accuracy = Total Hours Actual Time Confirmations for all Operations / Total Hours Planned Time Confirmations for all Operations', '[{"name": "actual_time_confirmation_hours", "data_type": "number", "description": null}, {"name": "completion_date", "data_type": "date", "description": null}, {"name": "planned_time_confirmation_hours", "data_type": "number", "description": null}, {"name": "work_order_id", "data_type": "string", "description": null}]', NULL, NULL, NULL, false, false, NULL),
	(62, '2025-09-08 04:19:55.920392+00', '2025-09-08 04:19:55.920392+00', 'Notification Ratio', 'A summation of notifications created by RDC compared to all notifications created.', 'ratio', 'SAP', 'To view the ratio of work generated by Operations compared to Maintenance.', 'Notification Ratio = Total Count Notifications Created by RDC / Total Count All Notifications', '[{"name": "created_by", "data_type": "string", "description": null}, {"name": "creation_date", "data_type": "date", "description": null}, {"name": "notification_id", "data_type": "string", "description": null}]', NULL, NULL, NULL, false, false, NULL),
	(63, '2025-09-08 04:19:56.226256+00', '2025-09-08 04:19:56.226256+00', 'Corrective Work Profile', 'Corrective work orders measured against total of all Preventative and Corrective work orders over a period. Period will be measured over the same time frame', 'ratio', 'SAP', 'To view the ratio of Corrective work against Preventative work. It provides an indication of how much work is reactive or non-proactive and unscheduled in maintaining the Asset.', 'Corrective Profile = Total Count Preventative Work Orders / Total Work Orders Count', '[{"name": "completion_date", "data_type": "date", "description": null}, {"name": "work_order_id", "data_type": "string", "description": null}, {"name": "work_order_status", "data_type": "string", "description": null}, {"name": "work_order_type", "data_type": "string", "description": null}]', NULL, NULL, NULL, false, false, NULL),
	(64, '2025-09-08 04:19:56.553105+00', '2025-09-08 04:19:56.553105+00', 'Cost Estimate Accuracy (Future)', 'The sum of actual work order costs for all work orders completed for that period compared to the sum planned work order costs for all work orders completed – expressed as a percentage.', 'ratio', 'SAP', 'To view the accuracy of the work order planning function with estimation of works through costing.', 'Cost Estimate Accuracy = Total Actual Work Order Costs / Total Planned Work Order Costs', '[{"name": "actual_work_order_cost", "data_type": "number", "description": null}, {"name": "completion_date", "data_type": "date", "description": null}, {"name": "planned_work_order_cost", "data_type": "number", "description": null}, {"name": "work_order_id", "data_type": "string", "description": null}]', NULL, NULL, NULL, false, false, NULL),
	(65, '2025-09-08 04:19:56.849278+00', '2025-09-08 04:19:56.849278+00', 'Preventative Work Compliance (Manual)', 'A percentage of preventative work orders completed on time measured against all preventative work orders compliance date over a period.', 'ratio', 'SAP', 'To view effectiveness of completing Preventative work on time to assure Asset compliance and capability.', 'Preventative Work Compliance = Total Preventative Work Orders Completed on Time / Total Preventative Work Orders', '[{"name": "completion_date", "data_type": "date", "description": null}, {"name": "compliance_date", "data_type": "date", "description": null}, {"name": "work_order_id", "data_type": "string", "description": null}, {"name": "work_order_status", "data_type": "string", "description": null}, {"name": "work_order_type", "data_type": "string", "description": null}]', NULL, NULL, NULL, false, false, NULL),
	(66, '2025-09-08 04:19:57.112872+00', '2025-09-08 04:19:57.112872+00', 'Break-In Work Ratio Hours', 'The ratio of the break-in maintenance work to the total maintenance work based on hours booked to work order type calculated over the same period', 'ratio', 'SAP', 'The break-in work ratio measures the distribution of the maintenance work by showing the type of work that maintenance resources are executing.', 'Break-In Work Ratio Hours = Total Hours from Break-In Work Orders Completed / Total Hours from All Work Orders Completed', '[{"name": "completion_date", "data_type": "date", "description": null}, {"name": "time_confirmation_hours", "data_type": "number", "description": null}, {"name": "work_order_id", "data_type": "string", "description": null}, {"name": "work_order_status", "data_type": "string", "description": null}, {"name": "work_order_type", "data_type": "string", "description": null}]', NULL, NULL, NULL, true, false, NULL),
	(67, '2025-09-08 04:19:57.42043+00', '2025-09-08 04:19:57.42043+00', 'Scheduled  Work Type Ratio', 'The percentage of the all scheduled work orders over 12 months as a ratio of Preventative (PM01) and Corrective (PM02). Work Order measure by count of work orders. Scheduled work is all work orders in the current week with a revision assigned.', 'ratio', 'SAP', 'To view the ratio of work type scheduled for the schedule period.', 'Schedule Type Ratio = PM01 or PM02 Work Orders / Total All PM01 & PM02 Work Orders', '[{"name": "completion_date", "data_type": "date", "description": null}, {"name": "revision", "data_type": "string", "description": null}, {"name": "scheduled_start_date", "data_type": "date", "description": null}, {"name": "work_order_id", "data_type": "string", "description": null}, {"name": "work_order_status", "data_type": "string", "description": null}, {"name": "work_order_type", "data_type": "string", "description": null}]', NULL, NULL, NULL, true, false, NULL);


--
-- Data for Name: measurements_calculated; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: program_measurements; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: program_objectives; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: questionnaire_rating_scales; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."questionnaire_rating_scales" ("id", "created_at", "updated_at", "name", "description", "order_index", "value", "created_by", "questionnaire_id", "is_deleted", "deleted_at", "company_id") VALUES
	(1, '2025-10-31 03:41:14.098691+00', '2025-10-31 03:41:14.098691+00', 'Critical', 'Significant issues requiring immediate intervention. Performance well below acceptable standards with multiple failures or blockages.', 1, 1, '00000000-0000-0000-0000-000000000001', 1, false, NULL, 'b64d182f-0ee3-40a0-b367-281f31902620'),
	(2, '2025-10-31 03:41:24.042281+00', '2025-10-31 03:41:24.042281+00', 'Below Standard', 'Notable challenges impacting effectiveness. Performance below expectations with frequent issues requiring corrective action.', 2, 2, '00000000-0000-0000-0000-000000000001', 1, false, NULL, 'b64d182f-0ee3-40a0-b367-281f31902620'),
	(3, '2025-10-31 03:41:34.490044+00', '2025-10-31 03:41:34.490044+00', 'Acceptable', 'Meeting minimum requirements with some challenges. Performance is adequate but has room for improvement.', 3, 3, '00000000-0000-0000-0000-000000000001', 1, false, NULL, 'b64d182f-0ee3-40a0-b367-281f31902620'),
	(4, '2025-10-31 03:41:44.00868+00', '2025-10-31 03:41:44.00868+00', 'Effective', 'Consistently meeting expectations with minor issues. Performance is reliable with only occasional adjustments needed.', 4, 4, '00000000-0000-0000-0000-000000000001', 1, false, NULL, 'b64d182f-0ee3-40a0-b367-281f31902620'),
	(5, '2025-10-31 03:41:52.231467+00', '2025-10-31 03:41:52.231467+00', 'Optimal', 'Exceeding expectations with minimal to no issues. Performance is excellent and can serve as a best practice example.', 5, 5, '00000000-0000-0000-0000-000000000001', 1, false, NULL, 'b64d182f-0ee3-40a0-b367-281f31902620'),
	(6, '2025-10-31 08:01:44.206035+00', '2025-10-31 08:01:44.206035+00', 'Bad', 'Bad', 1, 0, '00000000-0000-0000-0000-000000000001', 2, false, NULL, 'b64d182f-0ee3-40a0-b367-281f31902620'),
	(7, '2025-10-31 08:01:56.11966+00', '2025-10-31 08:01:56.11966+00', 'Good', 'Good', 2, 1, '00000000-0000-0000-0000-000000000001', 2, false, NULL, 'b64d182f-0ee3-40a0-b367-281f31902620');


--
-- Data for Name: questionnaire_question_rating_scales; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."questionnaire_question_rating_scales" ("id", "created_at", "updated_at", "created_by", "questionnaire_question_id", "questionnaire_rating_scale_id", "description", "deleted_at", "is_deleted", "questionnaire_id", "company_id") VALUES
	(1, '2025-10-31 03:43:19.219296+00', '2025-10-31 03:43:19.219296+00', '00000000-0000-0000-0000-000000000001', 1, 1, 'Significant issues requiring immediate intervention. Performance well below acceptable standards with multiple failures or blockages.', NULL, false, 1, 'b64d182f-0ee3-40a0-b367-281f31902620'),
	(2, '2025-10-31 03:43:19.219296+00', '2025-10-31 03:43:19.219296+00', '00000000-0000-0000-0000-000000000001', 1, 2, 'Notable challenges impacting effectiveness. Performance below expectations with frequent issues requiring corrective action.', NULL, false, 1, 'b64d182f-0ee3-40a0-b367-281f31902620'),
	(3, '2025-10-31 03:43:19.219296+00', '2025-10-31 03:43:19.219296+00', '00000000-0000-0000-0000-000000000001', 1, 3, 'Meeting minimum requirements with some challenges. Performance is adequate but has room for improvement.', NULL, false, 1, 'b64d182f-0ee3-40a0-b367-281f31902620'),
	(4, '2025-10-31 03:43:19.219296+00', '2025-10-31 03:43:19.219296+00', '00000000-0000-0000-0000-000000000001', 1, 4, 'Consistently meeting expectations with minor issues. Performance is reliable with only occasional adjustments needed.', NULL, false, 1, 'b64d182f-0ee3-40a0-b367-281f31902620'),
	(5, '2025-10-31 03:43:19.219296+00', '2025-10-31 03:43:19.219296+00', '00000000-0000-0000-0000-000000000001', 1, 5, 'Exceeding expectations with minimal to no issues. Performance is excellent and can serve as a best practice example.', NULL, false, 1, 'b64d182f-0ee3-40a0-b367-281f31902620'),
	(6, '2025-10-31 03:44:01.755718+00', '2025-10-31 03:44:01.755718+00', '00000000-0000-0000-0000-000000000001', 2, 1, 'Significant issues requiring immediate intervention. Performance well below acceptable standards with multiple failures or blockages.', NULL, false, 1, 'b64d182f-0ee3-40a0-b367-281f31902620'),
	(7, '2025-10-31 03:44:01.755718+00', '2025-10-31 03:44:01.755718+00', '00000000-0000-0000-0000-000000000001', 2, 2, 'Notable challenges impacting effectiveness. Performance below expectations with frequent issues requiring corrective action.', NULL, false, 1, 'b64d182f-0ee3-40a0-b367-281f31902620'),
	(8, '2025-10-31 03:44:01.755718+00', '2025-10-31 03:44:01.755718+00', '00000000-0000-0000-0000-000000000001', 2, 3, 'Meeting minimum requirements with some challenges. Performance is adequate but has room for improvement.', NULL, false, 1, 'b64d182f-0ee3-40a0-b367-281f31902620'),
	(9, '2025-10-31 03:44:01.755718+00', '2025-10-31 03:44:01.755718+00', '00000000-0000-0000-0000-000000000001', 2, 4, 'Consistently meeting expectations with minor issues. Performance is reliable with only occasional adjustments needed.', NULL, false, 1, 'b64d182f-0ee3-40a0-b367-281f31902620'),
	(10, '2025-10-31 03:44:01.755718+00', '2025-10-31 03:44:01.755718+00', '00000000-0000-0000-0000-000000000001', 2, 5, 'Exceeding expectations with minimal to no issues. Performance is excellent and can serve as a best practice example.', NULL, false, 1, 'b64d182f-0ee3-40a0-b367-281f31902620'),
	(11, '2025-10-31 03:44:20.961876+00', '2025-10-31 03:44:20.961876+00', '00000000-0000-0000-0000-000000000001', 3, 1, 'Significant issues requiring immediate intervention. Performance well below acceptable standards with multiple failures or blockages.', NULL, false, 1, 'b64d182f-0ee3-40a0-b367-281f31902620'),
	(12, '2025-10-31 03:44:20.961876+00', '2025-10-31 03:44:20.961876+00', '00000000-0000-0000-0000-000000000001', 3, 2, 'Notable challenges impacting effectiveness. Performance below expectations with frequent issues requiring corrective action.', NULL, false, 1, 'b64d182f-0ee3-40a0-b367-281f31902620'),
	(13, '2025-10-31 03:44:20.961876+00', '2025-10-31 03:44:20.961876+00', '00000000-0000-0000-0000-000000000001', 3, 3, 'Meeting minimum requirements with some challenges. Performance is adequate but has room for improvement.', NULL, false, 1, 'b64d182f-0ee3-40a0-b367-281f31902620'),
	(14, '2025-10-31 03:44:20.961876+00', '2025-10-31 03:44:20.961876+00', '00000000-0000-0000-0000-000000000001', 3, 4, 'Consistently meeting expectations with minor issues. Performance is reliable with only occasional adjustments needed.', NULL, false, 1, 'b64d182f-0ee3-40a0-b367-281f31902620'),
	(15, '2025-10-31 03:44:20.961876+00', '2025-10-31 03:44:20.961876+00', '00000000-0000-0000-0000-000000000001', 3, 5, 'Exceeding expectations with minimal to no issues. Performance is excellent and can serve as a best practice example.', NULL, false, 1, 'b64d182f-0ee3-40a0-b367-281f31902620'),
	(16, '2025-10-31 03:44:34.062548+00', '2025-10-31 03:44:34.062548+00', '00000000-0000-0000-0000-000000000001', 4, 1, 'Significant issues requiring immediate intervention. Performance well below acceptable standards with multiple failures or blockages.', NULL, false, 1, 'b64d182f-0ee3-40a0-b367-281f31902620'),
	(17, '2025-10-31 03:44:34.062548+00', '2025-10-31 03:44:34.062548+00', '00000000-0000-0000-0000-000000000001', 4, 2, 'Notable challenges impacting effectiveness. Performance below expectations with frequent issues requiring corrective action.', NULL, false, 1, 'b64d182f-0ee3-40a0-b367-281f31902620'),
	(18, '2025-10-31 03:44:34.062548+00', '2025-10-31 03:44:34.062548+00', '00000000-0000-0000-0000-000000000001', 4, 3, 'Meeting minimum requirements with some challenges. Performance is adequate but has room for improvement.', NULL, false, 1, 'b64d182f-0ee3-40a0-b367-281f31902620'),
	(19, '2025-10-31 03:44:34.062548+00', '2025-10-31 03:44:34.062548+00', '00000000-0000-0000-0000-000000000001', 4, 4, 'Consistently meeting expectations with minor issues. Performance is reliable with only occasional adjustments needed.', NULL, false, 1, 'b64d182f-0ee3-40a0-b367-281f31902620'),
	(20, '2025-10-31 03:44:34.062548+00', '2025-10-31 03:44:34.062548+00', '00000000-0000-0000-0000-000000000001', 4, 5, 'Exceeding expectations with minimal to no issues. Performance is excellent and can serve as a best practice example.', NULL, false, 1, 'b64d182f-0ee3-40a0-b367-281f31902620'),
	(21, '2025-10-31 03:44:45.07915+00', '2025-10-31 03:44:45.07915+00', '00000000-0000-0000-0000-000000000001', 5, 1, 'Significant issues requiring immediate intervention. Performance well below acceptable standards with multiple failures or blockages.', NULL, false, 1, 'b64d182f-0ee3-40a0-b367-281f31902620'),
	(22, '2025-10-31 03:44:45.07915+00', '2025-10-31 03:44:45.07915+00', '00000000-0000-0000-0000-000000000001', 5, 2, 'Notable challenges impacting effectiveness. Performance below expectations with frequent issues requiring corrective action.', NULL, false, 1, 'b64d182f-0ee3-40a0-b367-281f31902620'),
	(23, '2025-10-31 03:44:45.07915+00', '2025-10-31 03:44:45.07915+00', '00000000-0000-0000-0000-000000000001', 5, 3, 'Meeting minimum requirements with some challenges. Performance is adequate but has room for improvement.', NULL, false, 1, 'b64d182f-0ee3-40a0-b367-281f31902620'),
	(24, '2025-10-31 03:44:45.07915+00', '2025-10-31 03:44:45.07915+00', '00000000-0000-0000-0000-000000000001', 5, 4, 'Consistently meeting expectations with minor issues. Performance is reliable with only occasional adjustments needed.', NULL, false, 1, 'b64d182f-0ee3-40a0-b367-281f31902620'),
	(25, '2025-10-31 03:44:45.07915+00', '2025-10-31 03:44:45.07915+00', '00000000-0000-0000-0000-000000000001', 5, 5, 'Exceeding expectations with minimal to no issues. Performance is excellent and can serve as a best practice example.', NULL, false, 1, 'b64d182f-0ee3-40a0-b367-281f31902620'),
	(26, '2025-10-31 03:46:35.509192+00', '2025-10-31 03:46:35.509192+00', '00000000-0000-0000-0000-000000000001', 6, 1, 'Significant issues requiring immediate intervention. Performance well below acceptable standards with multiple failures or blockages.', NULL, false, 1, 'b64d182f-0ee3-40a0-b367-281f31902620'),
	(27, '2025-10-31 03:46:35.509192+00', '2025-10-31 03:46:35.509192+00', '00000000-0000-0000-0000-000000000001', 6, 2, 'Notable challenges impacting effectiveness. Performance below expectations with frequent issues requiring corrective action.', NULL, false, 1, 'b64d182f-0ee3-40a0-b367-281f31902620'),
	(28, '2025-10-31 03:46:35.509192+00', '2025-10-31 03:46:35.509192+00', '00000000-0000-0000-0000-000000000001', 6, 3, 'Meeting minimum requirements with some challenges. Performance is adequate but has room for improvement.', NULL, false, 1, 'b64d182f-0ee3-40a0-b367-281f31902620'),
	(29, '2025-10-31 03:46:35.509192+00', '2025-10-31 03:46:35.509192+00', '00000000-0000-0000-0000-000000000001', 6, 4, 'Consistently meeting expectations with minor issues. Performance is reliable with only occasional adjustments needed.', NULL, false, 1, 'b64d182f-0ee3-40a0-b367-281f31902620'),
	(30, '2025-10-31 03:46:35.509192+00', '2025-10-31 03:46:35.509192+00', '00000000-0000-0000-0000-000000000001', 6, 5, 'Exceeding expectations with minimal to no issues. Performance is excellent and can serve as a best practice example.', NULL, false, 1, 'b64d182f-0ee3-40a0-b367-281f31902620'),
	(31, '2025-10-31 03:46:56.182349+00', '2025-10-31 03:46:56.182349+00', '00000000-0000-0000-0000-000000000001', 7, 1, 'Significant issues requiring immediate intervention. Performance well below acceptable standards with multiple failures or blockages.', NULL, false, 1, 'b64d182f-0ee3-40a0-b367-281f31902620'),
	(32, '2025-10-31 03:46:56.182349+00', '2025-10-31 03:46:56.182349+00', '00000000-0000-0000-0000-000000000001', 7, 2, 'Notable challenges impacting effectiveness. Performance below expectations with frequent issues requiring corrective action.', NULL, false, 1, 'b64d182f-0ee3-40a0-b367-281f31902620'),
	(33, '2025-10-31 03:46:56.182349+00', '2025-10-31 03:46:56.182349+00', '00000000-0000-0000-0000-000000000001', 7, 3, 'Meeting minimum requirements with some challenges. Performance is adequate but has room for improvement.', NULL, false, 1, 'b64d182f-0ee3-40a0-b367-281f31902620'),
	(34, '2025-10-31 03:46:56.182349+00', '2025-10-31 03:46:56.182349+00', '00000000-0000-0000-0000-000000000001', 7, 4, 'Consistently meeting expectations with minor issues. Performance is reliable with only occasional adjustments needed.', NULL, false, 1, 'b64d182f-0ee3-40a0-b367-281f31902620'),
	(35, '2025-10-31 03:46:56.182349+00', '2025-10-31 03:46:56.182349+00', '00000000-0000-0000-0000-000000000001', 7, 5, 'Exceeding expectations with minimal to no issues. Performance is excellent and can serve as a best practice example.', NULL, false, 1, 'b64d182f-0ee3-40a0-b367-281f31902620'),
	(36, '2025-10-31 03:47:09.107664+00', '2025-10-31 03:47:09.107664+00', '00000000-0000-0000-0000-000000000001', 8, 1, 'Significant issues requiring immediate intervention. Performance well below acceptable standards with multiple failures or blockages.', NULL, false, 1, 'b64d182f-0ee3-40a0-b367-281f31902620'),
	(37, '2025-10-31 03:47:09.107664+00', '2025-10-31 03:47:09.107664+00', '00000000-0000-0000-0000-000000000001', 8, 2, 'Notable challenges impacting effectiveness. Performance below expectations with frequent issues requiring corrective action.', NULL, false, 1, 'b64d182f-0ee3-40a0-b367-281f31902620'),
	(38, '2025-10-31 03:47:09.107664+00', '2025-10-31 03:47:09.107664+00', '00000000-0000-0000-0000-000000000001', 8, 3, 'Meeting minimum requirements with some challenges. Performance is adequate but has room for improvement.', NULL, false, 1, 'b64d182f-0ee3-40a0-b367-281f31902620'),
	(39, '2025-10-31 03:47:09.107664+00', '2025-10-31 03:47:09.107664+00', '00000000-0000-0000-0000-000000000001', 8, 4, 'Consistently meeting expectations with minor issues. Performance is reliable with only occasional adjustments needed.', NULL, false, 1, 'b64d182f-0ee3-40a0-b367-281f31902620'),
	(40, '2025-10-31 03:47:09.107664+00', '2025-10-31 03:47:09.107664+00', '00000000-0000-0000-0000-000000000001', 8, 5, 'Exceeding expectations with minimal to no issues. Performance is excellent and can serve as a best practice example.', NULL, false, 1, 'b64d182f-0ee3-40a0-b367-281f31902620'),
	(41, '2025-10-31 03:47:25.452122+00', '2025-10-31 03:47:25.452122+00', '00000000-0000-0000-0000-000000000001', 9, 1, 'Significant issues requiring immediate intervention. Performance well below acceptable standards with multiple failures or blockages.', NULL, false, 1, 'b64d182f-0ee3-40a0-b367-281f31902620'),
	(42, '2025-10-31 03:47:25.452122+00', '2025-10-31 03:47:25.452122+00', '00000000-0000-0000-0000-000000000001', 9, 2, 'Notable challenges impacting effectiveness. Performance below expectations with frequent issues requiring corrective action.', NULL, false, 1, 'b64d182f-0ee3-40a0-b367-281f31902620'),
	(43, '2025-10-31 03:47:25.452122+00', '2025-10-31 03:47:25.452122+00', '00000000-0000-0000-0000-000000000001', 9, 3, 'Meeting minimum requirements with some challenges. Performance is adequate but has room for improvement.', NULL, false, 1, 'b64d182f-0ee3-40a0-b367-281f31902620'),
	(44, '2025-10-31 03:47:25.452122+00', '2025-10-31 03:47:25.452122+00', '00000000-0000-0000-0000-000000000001', 9, 4, 'Consistently meeting expectations with minor issues. Performance is reliable with only occasional adjustments needed.', NULL, false, 1, 'b64d182f-0ee3-40a0-b367-281f31902620'),
	(45, '2025-10-31 03:47:25.452122+00', '2025-10-31 03:47:25.452122+00', '00000000-0000-0000-0000-000000000001', 9, 5, 'Exceeding expectations with minimal to no issues. Performance is excellent and can serve as a best practice example.', NULL, false, 1, 'b64d182f-0ee3-40a0-b367-281f31902620'),
	(46, '2025-10-31 03:47:44.794956+00', '2025-10-31 03:47:44.794956+00', '00000000-0000-0000-0000-000000000001', 10, 1, 'Significant issues requiring immediate intervention. Performance well below acceptable standards with multiple failures or blockages.', NULL, false, 1, 'b64d182f-0ee3-40a0-b367-281f31902620'),
	(47, '2025-10-31 03:47:44.794956+00', '2025-10-31 03:47:44.794956+00', '00000000-0000-0000-0000-000000000001', 10, 2, 'Notable challenges impacting effectiveness. Performance below expectations with frequent issues requiring corrective action.', NULL, false, 1, 'b64d182f-0ee3-40a0-b367-281f31902620'),
	(48, '2025-10-31 03:47:44.794956+00', '2025-10-31 03:47:44.794956+00', '00000000-0000-0000-0000-000000000001', 10, 3, 'Meeting minimum requirements with some challenges. Performance is adequate but has room for improvement.', NULL, false, 1, 'b64d182f-0ee3-40a0-b367-281f31902620'),
	(49, '2025-10-31 03:47:44.794956+00', '2025-10-31 03:47:44.794956+00', '00000000-0000-0000-0000-000000000001', 10, 4, 'Consistently meeting expectations with minor issues. Performance is reliable with only occasional adjustments needed.', NULL, false, 1, 'b64d182f-0ee3-40a0-b367-281f31902620'),
	(50, '2025-10-31 03:47:44.794956+00', '2025-10-31 03:47:44.794956+00', '00000000-0000-0000-0000-000000000001', 10, 5, 'Exceeding expectations with minimal to no issues. Performance is excellent and can serve as a best practice example.', NULL, false, 1, 'b64d182f-0ee3-40a0-b367-281f31902620'),
	(51, '2025-10-31 03:47:50.959009+00', '2025-10-31 03:47:50.959009+00', '00000000-0000-0000-0000-000000000001', 11, 1, 'Significant issues requiring immediate intervention. Performance well below acceptable standards with multiple failures or blockages.', NULL, false, 1, 'b64d182f-0ee3-40a0-b367-281f31902620'),
	(52, '2025-10-31 03:47:50.959009+00', '2025-10-31 03:47:50.959009+00', '00000000-0000-0000-0000-000000000001', 11, 2, 'Notable challenges impacting effectiveness. Performance below expectations with frequent issues requiring corrective action.', NULL, false, 1, 'b64d182f-0ee3-40a0-b367-281f31902620'),
	(53, '2025-10-31 03:47:50.959009+00', '2025-10-31 03:47:50.959009+00', '00000000-0000-0000-0000-000000000001', 11, 3, 'Meeting minimum requirements with some challenges. Performance is adequate but has room for improvement.', NULL, false, 1, 'b64d182f-0ee3-40a0-b367-281f31902620'),
	(54, '2025-10-31 03:47:50.959009+00', '2025-10-31 03:47:50.959009+00', '00000000-0000-0000-0000-000000000001', 11, 4, 'Consistently meeting expectations with minor issues. Performance is reliable with only occasional adjustments needed.', NULL, false, 1, 'b64d182f-0ee3-40a0-b367-281f31902620'),
	(55, '2025-10-31 03:47:50.959009+00', '2025-10-31 03:47:50.959009+00', '00000000-0000-0000-0000-000000000001', 11, 5, 'Exceeding expectations with minimal to no issues. Performance is excellent and can serve as a best practice example.', NULL, false, 1, 'b64d182f-0ee3-40a0-b367-281f31902620'),
	(56, '2025-10-31 08:02:52.80997+00', '2025-10-31 08:02:52.80997+00', '00000000-0000-0000-0000-000000000001', 12, 6, 'Bad', NULL, false, 2, 'b64d182f-0ee3-40a0-b367-281f31902620'),
	(57, '2025-10-31 08:02:52.80997+00', '2025-10-31 08:02:52.80997+00', '00000000-0000-0000-0000-000000000001', 12, 7, 'Good', NULL, false, 2, 'b64d182f-0ee3-40a0-b367-281f31902620');


--
-- Data for Name: questionnaire_question_roles; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."questionnaire_question_roles" ("id", "created_at", "created_by", "questionnaire_question_id", "shared_role_id", "is_deleted", "deleted_at", "updated_at", "questionnaire_id", "company_id") VALUES
	(1, '2025-10-31 04:11:42.826398+00', '00000000-0000-0000-0000-000000000001', 1, 200, false, NULL, '2025-10-31 04:11:42.826398+00', 1, 'b64d182f-0ee3-40a0-b367-281f31902620'),
	(2, '2025-10-31 04:11:42.826398+00', '00000000-0000-0000-0000-000000000001', 1, 201, false, NULL, '2025-10-31 04:11:42.826398+00', 1, 'b64d182f-0ee3-40a0-b367-281f31902620'),
	(3, '2025-10-31 04:11:52.159938+00', '00000000-0000-0000-0000-000000000001', 2, 200, false, NULL, '2025-10-31 04:11:52.159938+00', 1, 'b64d182f-0ee3-40a0-b367-281f31902620'),
	(4, '2025-10-31 04:11:52.159938+00', '00000000-0000-0000-0000-000000000001', 2, 201, false, NULL, '2025-10-31 04:11:52.159938+00', 1, 'b64d182f-0ee3-40a0-b367-281f31902620'),
	(5, '2025-10-31 04:12:01.97872+00', '00000000-0000-0000-0000-000000000001', 3, 200, false, NULL, '2025-10-31 04:12:01.97872+00', 1, 'b64d182f-0ee3-40a0-b367-281f31902620'),
	(6, '2025-10-31 04:12:01.97872+00', '00000000-0000-0000-0000-000000000001', 3, 201, false, NULL, '2025-10-31 04:12:01.97872+00', 1, 'b64d182f-0ee3-40a0-b367-281f31902620'),
	(7, '2025-10-31 04:12:11.898977+00', '00000000-0000-0000-0000-000000000001', 4, 200, false, NULL, '2025-10-31 04:12:11.898977+00', 1, 'b64d182f-0ee3-40a0-b367-281f31902620'),
	(8, '2025-10-31 04:12:11.898977+00', '00000000-0000-0000-0000-000000000001', 4, 201, false, NULL, '2025-10-31 04:12:11.898977+00', 1, 'b64d182f-0ee3-40a0-b367-281f31902620'),
	(9, '2025-10-31 04:12:20.274166+00', '00000000-0000-0000-0000-000000000001', 5, 200, false, NULL, '2025-10-31 04:12:20.274166+00', 1, 'b64d182f-0ee3-40a0-b367-281f31902620'),
	(10, '2025-10-31 04:12:20.274166+00', '00000000-0000-0000-0000-000000000001', 5, 201, false, NULL, '2025-10-31 04:12:20.274166+00', 1, 'b64d182f-0ee3-40a0-b367-281f31902620'),
	(11, '2025-10-31 04:12:29.267835+00', '00000000-0000-0000-0000-000000000001', 6, 200, false, NULL, '2025-10-31 04:12:29.267835+00', 1, 'b64d182f-0ee3-40a0-b367-281f31902620'),
	(12, '2025-10-31 04:12:29.267835+00', '00000000-0000-0000-0000-000000000001', 6, 201, false, NULL, '2025-10-31 04:12:29.267835+00', 1, 'b64d182f-0ee3-40a0-b367-281f31902620'),
	(13, '2025-10-31 04:12:38.701343+00', '00000000-0000-0000-0000-000000000001', 7, 200, false, NULL, '2025-10-31 04:12:38.701343+00', 1, 'b64d182f-0ee3-40a0-b367-281f31902620'),
	(14, '2025-10-31 04:12:38.701343+00', '00000000-0000-0000-0000-000000000001', 7, 201, false, NULL, '2025-10-31 04:12:38.701343+00', 1, 'b64d182f-0ee3-40a0-b367-281f31902620'),
	(15, '2025-10-31 04:12:47.130629+00', '00000000-0000-0000-0000-000000000001', 8, 200, false, NULL, '2025-10-31 04:12:47.130629+00', 1, 'b64d182f-0ee3-40a0-b367-281f31902620'),
	(16, '2025-10-31 04:12:47.130629+00', '00000000-0000-0000-0000-000000000001', 8, 201, false, NULL, '2025-10-31 04:12:47.130629+00', 1, 'b64d182f-0ee3-40a0-b367-281f31902620'),
	(17, '2025-10-31 04:12:53.788946+00', '00000000-0000-0000-0000-000000000001', 9, 200, false, NULL, '2025-10-31 04:12:53.788946+00', 1, 'b64d182f-0ee3-40a0-b367-281f31902620'),
	(18, '2025-10-31 04:12:53.788946+00', '00000000-0000-0000-0000-000000000001', 9, 201, false, NULL, '2025-10-31 04:12:53.788946+00', 1, 'b64d182f-0ee3-40a0-b367-281f31902620'),
	(19, '2025-10-31 04:13:00.417936+00', '00000000-0000-0000-0000-000000000001', 10, 200, false, NULL, '2025-10-31 04:13:00.417936+00', 1, 'b64d182f-0ee3-40a0-b367-281f31902620'),
	(20, '2025-10-31 04:13:00.417936+00', '00000000-0000-0000-0000-000000000001', 10, 201, false, NULL, '2025-10-31 04:13:00.417936+00', 1, 'b64d182f-0ee3-40a0-b367-281f31902620'),
	(21, '2025-10-31 04:13:07.376015+00', '00000000-0000-0000-0000-000000000001', 11, 200, false, NULL, '2025-10-31 04:13:07.376015+00', 1, 'b64d182f-0ee3-40a0-b367-281f31902620'),
	(22, '2025-10-31 04:13:07.376015+00', '00000000-0000-0000-0000-000000000001', 11, 201, false, NULL, '2025-10-31 04:13:07.376015+00', 1, 'b64d182f-0ee3-40a0-b367-281f31902620');


--
-- Data for Name: recommendations; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: region_contacts; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: role_contacts; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."role_contacts" ("role_id", "contact_id", "created_at", "created_by", "company_id") VALUES
	(2, 2, '2025-10-31 05:21:33.87781+00', '00000000-0000-0000-0000-000000000001', 'b64d182f-0ee3-40a0-b367-281f31902620'),
	(7, 1, '2025-10-31 03:31:59.09276+00', '00000000-0000-0000-0000-000000000001', 'b64d182f-0ee3-40a0-b367-281f31902620');


--
-- Data for Name: site_contacts; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: user_companies; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."user_companies" ("id", "created_at", "updated_at", "user_id", "role", "created_by", "company_id") VALUES
	(1, '2025-10-31 08:07:30.082155+00', '2025-10-31 08:07:30.082155+00', '00000000-0000-0000-0000-000000000001', 'owner', '00000000-0000-0000-0000-000000000001', 'b64d182f-0ee3-40a0-b367-281f31902620'),
	(2, '2025-10-31 08:11:45.264523+00', '2025-10-31 08:11:45.264523+00', 'd5f1252a-9d56-47f8-98cf-f6f34914bb6c', 'interviewee', '00000000-0000-0000-0000-000000000001', 'b64d182f-0ee3-40a0-b367-281f31902620');


--
-- Data for Name: work_group_contacts; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: buckets; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

INSERT INTO "storage"."buckets" ("id", "name", "owner", "created_at", "updated_at", "public", "avif_autodetection", "file_size_limit", "allowed_mime_types", "owner_id", "type") VALUES
	('evidence', 'evidence', NULL, '2025-10-31 08:07:30.033817+00', '2025-10-31 08:07:30.033817+00', false, false, NULL, NULL, NULL, 'STANDARD');


--
-- Data for Name: buckets_analytics; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: iceberg_namespaces; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: iceberg_tables; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: objects; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: prefixes; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: s3_multipart_uploads; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: s3_multipart_uploads_parts; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: hooks; Type: TABLE DATA; Schema: supabase_functions; Owner: supabase_functions_admin
--



--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE SET; Schema: auth; Owner: supabase_auth_admin
--

SELECT pg_catalog.setval('"auth"."refresh_tokens_id_seq"', 1, true);


--
-- Name: assessment_objectives_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."assessment_objectives_id_seq"', 1, true);


--
-- Name: assessment_rating_scales_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."assessment_rating_scales_id_seq"', 8, false);


--
-- Name: assessment_templates_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."assessment_templates_id_seq"', 3, false);


--
-- Name: assessments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."assessments_id_seq"', 2, true);


--
-- Name: asset_groups_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."asset_groups_id_seq"', 12, false);


--
-- Name: business_units_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."business_units_id_seq"', 3, false);


--
-- Name: calculated_metrics_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."calculated_metrics_id_seq"', 1, false);


--
-- Name: contacts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."contacts_id_seq"', 3, false);


--
-- Name: dashboards_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."dashboards_id_seq"', 1, true);


--
-- Name: feedback_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."feedback_id_seq"', 1, false);


--
-- Name: interview_evidence_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."interview_evidence_id_seq"', 1, false);


--
-- Name: interview_question_applicable_roles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."interview_question_applicable_roles_id_seq"', 23, true);


--
-- Name: interview_question_part_responses_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."interview_question_part_responses_id_seq"', 1, false);


--
-- Name: interview_response_actions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."interview_response_actions_id_seq"', 1, false);


--
-- Name: interview_response_roles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."interview_response_roles_id_seq"', 12, true);


--
-- Name: interview_responses_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."interview_responses_id_seq"', 23, true);


--
-- Name: interview_roles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."interview_roles_id_seq"', 6, true);


--
-- Name: interviews_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."interviews_id_seq"', 3, true);


--
-- Name: metric_alignments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."metric_alignments_id_seq"', 1, false);


--
-- Name: metric_definitions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."metric_definitions_id_seq"', 68, false);


--
-- Name: program_executions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."program_executions_id_seq"', 2, false);


--
-- Name: program_metrics_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."program_metrics_id_seq"', 1, false);


--
-- Name: program_objectives_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."program_objectives_id_seq"', 1, false);


--
-- Name: programs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."programs_id_seq"', 2, false);


--
-- Name: question_rating_scales_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."question_rating_scales_id_seq"', 58, false);


--
-- Name: questionnaire_question_parts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."questionnaire_question_parts_id_seq"', 34, false);


--
-- Name: qustionnaire_question_roles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."qustionnaire_question_roles_id_seq"', 23, false);


--
-- Name: recommendations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."recommendations_id_seq"', 1, false);


--
-- Name: regions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."regions_id_seq"', 6, false);


--
-- Name: roles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."roles_id_seq"', 8, false);


--
-- Name: shared_roles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."shared_roles_id_seq"', 234, false);


--
-- Name: sites_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."sites_id_seq"', 8, false);


--
-- Name: survey_questions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."survey_questions_id_seq"', 13, false);


--
-- Name: survey_sections_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."survey_sections_id_seq"', 7, false);


--
-- Name: survey_steps_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."survey_steps_id_seq"', 12, false);


--
-- Name: user_companies_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."user_companies_id_seq"', 2, true);


--
-- Name: work_groups_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."work_groups_id_seq"', 10, false);


--
-- Name: hooks_id_seq; Type: SEQUENCE SET; Schema: supabase_functions; Owner: supabase_functions_admin
--

SELECT pg_catalog.setval('"supabase_functions"."hooks_id_seq"', 1, false);


--
-- PostgreSQL database dump complete
--

-- \unrestrict aZmQy3KEQ2c0j3N9s1bDunffc4utd5a7FxYzgYuwu7A5nV2JAGiYyYqhnakGcVN

RESET ALL;
