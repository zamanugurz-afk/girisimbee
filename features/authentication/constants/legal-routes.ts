/** Legal document routes linked from registration / publish consents. */
export const LEGAL_ROUTES = {
  terms: '/yasal/kullanici-sozlesmesi',
  kvkk: '/yasal/kvkk-aydinlatma',
  privacy: '/yasal/gizlilik',
  cookies: '/yasal/cerez',
  explicitConsent: '/yasal/acik-riza',
  contactCommunication: '/yasal/iletisim-mesajlasma',
} as const;

export const PUBLISH_LEGAL_LINKS = [
  {
    href: LEGAL_ROUTES.kvkk,
    label: 'KVKK aydınlatma metni',
    blurb: 'Verilerinizin nasıl işlendiğini açıklar.',
  },
  {
    href: LEGAL_ROUTES.explicitConsent,
    label: 'Açık rıza metni',
    blurb: 'İlan yayını ve telefon iletişimi için rıza kapsamı.',
  },
  {
    href: LEGAL_ROUTES.privacy,
    label: 'Gizlilik politikası',
    blurb: 'Veri saklama ve paylaşım ilkeleri.',
  },
  {
    href: LEGAL_ROUTES.terms,
    label: 'Kullanıcı sözleşmesi',
    blurb: 'Platform kullanım şartları.',
  },
] as const;
