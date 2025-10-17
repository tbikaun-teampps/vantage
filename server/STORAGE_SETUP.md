# Supabase Storage Setup for Company Icons

## Bucket Configuration

### Bucket Name
`company-icons`

### Bucket Settings
- **Public**: Yes (public bucket for company branding)
- **File Size Limit**: 2MB per file
- **Allowed MIME Types**:
  - `image/jpeg`
  - `image/png`
  - `image/svg+xml`

### Why Public?
Company icons are branding materials meant to be displayed publicly. Using a public bucket:
- Eliminates URL expiration issues (no signed URLs needed)
- Provides better UX (icons never break)
- Simplifies implementation
- Reduces server load (no URL generation on each request)

### Storage Operations
All storage operations (upload, delete) are performed using the **admin/service role client** to bypass RLS policies. This ensures:
- Uploads always succeed regardless of RLS configuration
- Consistent behavior across all operations
- No policy management complexity

## Setup Instructions

### Via Supabase Dashboard

1. Navigate to **Storage** in your Supabase project dashboard
2. Click **New bucket**
3. Name: `company-icons`
4. Set **Public bucket** to **ON** (public bucket)
5. Click **Create bucket**
6. **No policies needed** - public buckets don't require RLS policies

### Via Supabase CLI

```bash
# Create a public bucket
supabase storage create company-icons --public
```

No migration file or policies are needed for public buckets.

## File Path Structure

Icons will be stored using this path pattern:
```
company-icons/{companyId}/icon.{ext}
```

Where:
- `{companyId}`: The UUID of the company
- `{ext}`: File extension (jpg, png, or svg)

## Environment Variables

No additional environment variables are required. The bucket name `company-icons` is hardcoded in the `CompaniesService`.
