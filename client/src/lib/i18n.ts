import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      // Navigation
      nav: {
        home: 'Home',
        wallet: 'Wallet',
        scan: 'Scan',
        history: 'History',
        earn: 'Earn',
        send: 'Send',
        nfts: 'NFTs',
        settings: 'Settings'
      },
      // Common
      common: {
        save: 'Save',
        cancel: 'Cancel',
        confirm: 'Confirm',
        back: 'Back',
        skip: 'Skip',
        loading: 'Loading...',
        success: 'Success',
        error: 'Error',
        delete: 'Delete'
      },
      // Home
      home: {
        welcome: 'Welcome back',
        balance: 'Balance',
        portfolioValue: 'Portfolio Value',
        yourAsset: 'Your Asset',
        assets: 'Assets',
        price: 'Price',
        lastUpdated: 'Last updated',
        send: 'Send',
        receive: 'Receive',
        stake: 'Stake',
        transactions: 'Transaction History',
        recentActivity: 'Recent Activity'
      },
      // Wallet
      wallet: {
        title: 'Wallet',
        receive: 'Receive',
        send: 'Send',
        refresh: 'Refresh',
        assets: 'Assets',
        yourWalletAddress: 'Your USV wallet address',
        usvTokens: 'USV Tokens',
        solBalance: 'SOL Balance',
        copy: 'Copy',
        copied: 'Copied!',
        connectPhantom: 'Connect Phantom Wallet',
        disconnectPhantom: 'Disconnect Phantom',
        noWalletFound: 'No Phantom wallet found',
        installPhantom: 'Please install Phantom wallet',
        timeframe: {
          '1h': '1H',
          '24h': '24H',
          '7d': '7D',
          '30d': '30D'
        }
      },
      // Transaction History
      history: {
        title: 'Transaction History',
        noTransactions: 'No transactions yet',
        noTransactionsDescription: 'Your transaction history will appear here',
        filters: 'Filters',
        allTransactions: 'All Transactions',
        today: 'TODAY',
        yesterday: 'YESTERDAY',
        daysAgo: 'DAYS AGO',
        received: 'Received',
        sent: 'Sent',
        claimed: 'Claimed',
        staked: 'Staked',
        status: {
          completed: 'Completed',
          pending: 'Pending',
          failed: 'Failed'
        }
      },
      // Send
      send: {
        title: 'Send Tokens',
        recipient: 'Recipient Address',
        amount: 'Amount',
        sendButton: 'Send',
        confirmTransaction: 'Confirm Transaction',
        transactionSuccess: 'Transfer Successful!',
        transactionFailed: 'Transfer Failed',
        saveAddress: 'Save Address?',
        saveAddressDescription: 'Would you like to save this address to your address book for future use?',
        addressLabel: 'Label (Optional)',
        addressLabelPlaceholder: 'e.g., Exchange, Friend\'s wallet'
      },
      // Settings
      settings: {
        title: 'Settings',
        profile: 'Profile',
        preferences: 'Preferences',
        pushNotifications: 'Push Notifications',
        emailNotifications: 'Email Notifications',
        language: 'Language',
        twoFactor: 'Two-Factor Authentication',
        security: 'Security',
        savedAddresses: 'Saved Addresses',
        manageAddresses: 'Manage your saved addresses',
        logout: 'Logout',
        logOut: 'Log Out',
        updateSuccess: 'Settings Updated',
        updateFailed: 'Update Failed',
        appearance: 'Appearance',
        theme: 'Theme',
        lightMode: 'Light Mode',
        darkMode: 'Dark Mode',
        setupPasscode: 'Setup Passcode',
        changePasscode: 'Change Passcode',
        exportMyData: 'Export My Data',
        termsOfService: 'Terms of Service',
        testNotification: 'Send Test Notification',
        enable2FA: 'Enable Two-Factor Authentication',
        disable2FA: 'Disable Two-Factor Authentication'
      },
      // Saved Addresses
      savedAddresses: {
        title: 'Saved Addresses',
        noAddresses: 'No saved addresses yet',
        addFirst: 'Start by sending tokens to an address and saving it for future use.',
        deleteConfirm: 'Are you sure you want to delete this address?',
        deleteSuccess: 'Address deleted successfully',
        deleteFailed: 'Failed to delete address',
        saveSuccess: 'Address saved successfully',
        saveFailed: 'Failed to save address'
      },
      // NFTs
      nfts: {
        title: 'My NFTs',
        portfolio: 'NFT Portfolio',
        noNfts: 'No NFTs found',
        authenticated: 'Authenticated Products'
      }
    }
  },
  es: {
    translation: {
      // Navigation
      nav: {
        home: 'Inicio',
        wallet: 'Billetera',
        scan: 'Escanear',
        history: 'Historial',
        earn: 'Ganar',
        send: 'Enviar',
        nfts: 'NFTs',
        settings: 'Ajustes'
      },
      // Common
      common: {
        save: 'Guardar',
        cancel: 'Cancelar',
        confirm: 'Confirmar',
        back: 'Volver',
        skip: 'Omitir',
        loading: 'Cargando...',
        success: 'Éxito',
        error: 'Error',
        delete: 'Eliminar'
      },
      // Home
      home: {
        welcome: 'Bienvenido',
        balance: 'Saldo',
        portfolioValue: 'Valor del Portafolio',
        yourAsset: 'Tus Activos',
        assets: 'Activos',
        price: 'Precio',
        lastUpdated: 'Última actualización',
        send: 'Enviar',
        receive: 'Recibir',
        stake: 'Apostar',
        transactions: 'Historial de Transacciones',
        recentActivity: 'Actividad Reciente'
      },
      // Wallet
      wallet: {
        title: 'Billetera',
        receive: 'Recibir',
        send: 'Enviar',
        refresh: 'Actualizar',
        assets: 'Activos',
        yourWalletAddress: 'Tu dirección de billetera USV',
        usvTokens: 'Tokens USV',
        solBalance: 'Saldo SOL',
        copy: 'Copiar',
        copied: '¡Copiado!',
        connectPhantom: 'Conectar Billetera Phantom',
        disconnectPhantom: 'Desconectar Phantom',
        noWalletFound: 'No se encontró billetera Phantom',
        installPhantom: 'Por favor instala la billetera Phantom',
        timeframe: {
          '1h': '1H',
          '24h': '24H',
          '7d': '7D',
          '30d': '30D'
        }
      },
      // Transaction History
      history: {
        title: 'Historial de Transacciones',
        noTransactions: 'No hay transacciones aún',
        noTransactionsDescription: 'Tu historial de transacciones aparecerá aquí',
        filters: 'Filtros',
        allTransactions: 'Todas las Transacciones',
        today: 'HOY',
        yesterday: 'AYER',
        daysAgo: 'HACE DÍAS',
        received: 'Recibido',
        sent: 'Enviado',
        claimed: 'Reclamado',
        staked: 'Apostado',
        status: {
          completed: 'Completado',
          pending: 'Pendiente',
          failed: 'Fallido'
        }
      },
      // Send
      send: {
        title: 'Enviar Tokens',
        recipient: 'Dirección del Destinatario',
        amount: 'Cantidad',
        sendButton: 'Enviar',
        confirmTransaction: 'Confirmar Transacción',
        transactionSuccess: '¡Transferencia Exitosa!',
        transactionFailed: 'Transferencia Fallida',
        saveAddress: '¿Guardar Dirección?',
        saveAddressDescription: '¿Le gustaría guardar esta dirección en su libreta para uso futuro?',
        addressLabel: 'Etiqueta (Opcional)',
        addressLabelPlaceholder: 'ej., Exchange, Billetera de amigo'
      },
      // Settings
      settings: {
        title: 'Ajustes',
        profile: 'Perfil',
        preferences: 'Preferencias',
        pushNotifications: 'Notificaciones Push',
        emailNotifications: 'Notificaciones por Email',
        language: 'Idioma',
        twoFactor: 'Autenticación de Dos Factores',
        security: 'Seguridad',
        savedAddresses: 'Direcciones Guardadas',
        manageAddresses: 'Administra tus direcciones guardadas',
        logout: 'Cerrar Sesión',
        logOut: 'Cerrar Sesión',
        updateSuccess: 'Ajustes Actualizados',
        updateFailed: 'Actualización Fallida',
        appearance: 'Apariencia',
        theme: 'Tema',
        lightMode: 'Modo Claro',
        darkMode: 'Modo Oscuro',
        setupPasscode: 'Configurar Código',
        changePasscode: 'Cambiar Código',
        exportMyData: 'Exportar Mis Datos',
        termsOfService: 'Términos de Servicio',
        testNotification: 'Enviar Notificación de Prueba',
        enable2FA: 'Habilitar Autenticación de Dos Factores',
        disable2FA: 'Deshabilitar Autenticación de Dos Factores'
      },
      // Saved Addresses
      savedAddresses: {
        title: 'Direcciones Guardadas',
        noAddresses: 'No hay direcciones guardadas aún',
        addFirst: 'Comienza enviando tokens a una dirección y guárdala para uso futuro.',
        deleteConfirm: '¿Está seguro de que desea eliminar esta dirección?',
        deleteSuccess: 'Dirección eliminada exitosamente',
        deleteFailed: 'Error al eliminar dirección',
        saveSuccess: 'Dirección guardada exitosamente',
        saveFailed: 'Error al guardar dirección'
      },
      // NFTs
      nfts: {
        title: 'Mis NFTs',
        portfolio: 'Portafolio de NFTs',
        noNfts: 'No se encontraron NFTs',
        authenticated: 'Productos Autenticados'
      }
    }
  },
  fr: {
    translation: {
      // Navigation
      nav: {
        home: 'Accueil',
        wallet: 'Portefeuille',
        scan: 'Scanner',
        history: 'Historique',
        earn: 'Gagner',
        send: 'Envoyer',
        nfts: 'NFTs',
        settings: 'Paramètres'
      },
      // Common
      common: {
        save: 'Enregistrer',
        cancel: 'Annuler',
        confirm: 'Confirmer',
        back: 'Retour',
        skip: 'Passer',
        loading: 'Chargement...',
        success: 'Succès',
        error: 'Erreur',
        delete: 'Supprimer'
      },
      // Home
      home: {
        welcome: 'Bienvenue',
        balance: 'Solde',
        portfolioValue: 'Valeur du Portefeuille',
        yourAsset: 'Vos Actifs',
        assets: 'Actifs',
        price: 'Prix',
        lastUpdated: 'Dernière mise à jour',
        send: 'Envoyer',
        receive: 'Recevoir',
        stake: 'Staker',
        transactions: 'Historique des Transactions',
        recentActivity: 'Activité Récente'
      },
      // Wallet
      wallet: {
        title: 'Portefeuille',
        receive: 'Recevoir',
        send: 'Envoyer',
        refresh: 'Actualiser',
        assets: 'Actifs',
        yourWalletAddress: 'Votre adresse de portefeuille USV',
        usvTokens: 'Jetons USV',
        solBalance: 'Solde SOL',
        copy: 'Copier',
        copied: 'Copié!',
        connectPhantom: 'Connecter Phantom Wallet',
        disconnectPhantom: 'Déconnecter Phantom',
        noWalletFound: 'Aucun portefeuille Phantom trouvé',
        installPhantom: 'Veuillez installer le portefeuille Phantom',
        timeframe: {
          '1h': '1H',
          '24h': '24H',
          '7d': '7J',
          '30d': '30J'
        }
      },
      // Transaction History
      history: {
        title: 'Historique des Transactions',
        noTransactions: 'Aucune transaction pour le moment',
        noTransactionsDescription: 'Votre historique de transactions apparaîtra ici',
        filters: 'Filtres',
        allTransactions: 'Toutes les Transactions',
        today: 'AUJOURD\'HUI',
        yesterday: 'HIER',
        daysAgo: 'IL Y A DES JOURS',
        received: 'Reçu',
        sent: 'Envoyé',
        claimed: 'Réclamé',
        staked: 'Staké',
        status: {
          completed: 'Complété',
          pending: 'En attente',
          failed: 'Échoué'
        }
      },
      // Send
      send: {
        title: 'Envoyer des Tokens',
        recipient: 'Adresse du Destinataire',
        amount: 'Montant',
        sendButton: 'Envoyer',
        confirmTransaction: 'Confirmer la Transaction',
        transactionSuccess: 'Transfert Réussi!',
        transactionFailed: 'Transfert Échoué',
        saveAddress: 'Sauvegarder l\'Adresse?',
        saveAddressDescription: 'Souhaitez-vous enregistrer cette adresse dans votre carnet d\'adresses?',
        addressLabel: 'Étiquette (Optionnel)',
        addressLabelPlaceholder: 'ex., Exchange, Portefeuille d\'ami'
      },
      // Settings
      settings: {
        title: 'Paramètres',
        profile: 'Profil',
        preferences: 'Préférences',
        pushNotifications: 'Notifications Push',
        emailNotifications: 'Notifications Email',
        language: 'Langue',
        twoFactor: 'Authentification à Deux Facteurs',
        security: 'Sécurité',
        savedAddresses: 'Adresses Sauvegardées',
        manageAddresses: 'Gérer vos adresses sauvegardées',
        logout: 'Déconnexion',
        logOut: 'Déconnexion',
        updateSuccess: 'Paramètres Mis à Jour',
        updateFailed: 'Mise à Jour Échouée',
        appearance: 'Apparence',
        theme: 'Thème',
        lightMode: 'Mode Clair',
        darkMode: 'Mode Sombre',
        setupPasscode: 'Configurer le Code',
        changePasscode: 'Changer le Code',
        exportMyData: 'Exporter Mes Données',
        termsOfService: 'Conditions d\'Utilisation',
        testNotification: 'Envoyer Notification de Test',
        enable2FA: 'Activer l\'Authentification à Deux Facteurs',
        disable2FA: 'Désactiver l\'Authentification à Deux Facteurs'
      },
      // Saved Addresses
      savedAddresses: {
        title: 'Adresses Sauvegardées',
        noAddresses: 'Aucune adresse sauvegardée',
        addFirst: 'Commencez par envoyer des tokens à une adresse et enregistrez-la.',
        deleteConfirm: 'Êtes-vous sûr de vouloir supprimer cette adresse?',
        deleteSuccess: 'Adresse supprimée avec succès',
        deleteFailed: 'Échec de la suppression de l\'adresse',
        saveSuccess: 'Adresse sauvegardée avec succès',
        saveFailed: 'Échec de la sauvegarde de l\'adresse'
      },
      // NFTs
      nfts: {
        title: 'Mes NFTs',
        portfolio: 'Portfolio NFT',
        noNfts: 'Aucun NFT trouvé',
        authenticated: 'Produits Authentifiés'
      }
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    lng: localStorage.getItem('i18nextLng') || 'en',
    interpolation: {
      escapeValue: false
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage']
    }
  });

export default i18n;
