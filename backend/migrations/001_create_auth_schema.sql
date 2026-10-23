
CREATE SCHEMA IF NOT EXISTS auth;

CREATE TABLE auth.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    name VARCHAR(150),
    email VARCHAR(255),
    password TEXT,
    avatar_url TEXT,
    role VARCHAR(20) NOT NULL DEFAULT 'developer',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX users_email_unique_lower_idx
    ON auth.users (LOWER(email))
    WHERE email IS NOT NULL;

CREATE TABLE auth.auth_identities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL
        REFERENCES auth.users(id)
        ON DELETE CASCADE,

    provider VARCHAR(20) NOT NULL
        CHECK (provider IN ('google', 'github')),

    provider_user_id VARCHAR(255) NOT NULL,
    provider_email VARCHAR(255),

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT auth_identity_provider_user_unique
        UNIQUE (provider, provider_user_id)
);

CREATE INDEX auth_identities_user_id_idx
    ON auth.auth_identities(user_id);
