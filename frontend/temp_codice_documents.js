  const documents = [
    {
      id: 1,
      name: 'Справка о доходах',
      status: user?.profile?.codice_document_1_uploaded ? 'uploaded' : 'pending',
      required: true,
      size: user?.profile?.codice_document_1_size || null,
      uploadedAt: user?.profile?.codice_document_1_uploaded_at || null
    },
    {
      id: 2,
      name: 'Копия паспорта',
      status: user?.profile?.codice_document_2_uploaded ? 'uploaded' : 'pending',
      required: true,
      size: user?.profile?.codice_document_2_size || null,
      uploadedAt: user?.profile?.codice_document_2_uploaded_at || null
    },
    {
      id: 3,
      name: 'Заявление на Codice Fiscale',
      status: user?.profile?.codice_document_3_uploaded ? 'uploaded' : 'pending',
      required: true,
      size: user?.profile?.codice_document_3_size || null,
      uploadedAt: user?.profile?.codice_document_3_uploaded_at || null
    },
    {
      id: 4,
      name: 'Квитанция об оплате',
      status: user?.profile?.codice_document_4_uploaded ? 'uploaded' : 'pending',
      required: true,
      size: user?.profile?.codice_document_4_size || null,
      uploadedAt: user?.profile?.codice_document_4_uploaded_at || null
    }
  ];
