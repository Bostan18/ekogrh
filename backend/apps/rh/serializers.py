from rest_framework import serializers

from .models import (
    BulletinPaie,
    Certification,
    Competence,
    CompetenceEmploye,
    Conge,
    Employe,
    HistoriqueContrat,
    LigneBulletin,
    MissionMoo,
    Paiement,
    PresenceJournaliere,
)


class EmployeSerializer(serializers.ModelSerializer):
    nom_complet = serializers.ReadOnlyField()
    jours_non_payes = serializers.IntegerField(read_only=True, default=0)
    restant = serializers.DecimalField(
        read_only=True, max_digits=12, decimal_places=2, default=0
    )

    class Meta:
        model = Employe
        fields = [
            "id",
            "code",
            "nom",
            "prenom",
            "nom_complet",
            "type_contrat",
            "poste",
            "telephone",
            "email",
            "adresse",
            "date_naissance",
            "statut",
            "date_entree",
            "date_sortie",
            "salaire_mensuel",
            "taux_journalier",
            "numero_cnps",
            "jours_non_payes",
            "restant",
            "user",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class PresenceJournaliereSerializer(serializers.ModelSerializer):
    employe_nom = serializers.CharField(source="employe.nom_complet", read_only=True)
    employe_code = serializers.CharField(source="employe.code", read_only=True)
    statut_display = serializers.CharField(
        source="get_statut_display", read_only=True, default=""
    )

    class Meta:
        model = PresenceJournaliere
        fields = [
            "id",
            "employe",
            "employe_nom",
            "employe_code",
            "date",
            "present",
            "heures_travaillees",
            "montant_du",
            "statut",
            "statut_display",
            "projet_ref",
            "site_ref",
            "notes",
            "paye_le",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "montant_du", "created_at", "updated_at"]


class BulletinPaieSerializer(serializers.ModelSerializer):
    employe_code = serializers.CharField(source="employe.code", read_only=True)
    employe_nom = serializers.CharField(source="employe.nom_complet", read_only=True)
    employe_poste = serializers.CharField(source="employe.poste", read_only=True)
    lignes = serializers.SerializerMethodField()

    class Meta:
        model = BulletinPaie
        fields = [
            "id",
            "employe",
            "employe_code",
            "employe_nom",
            "employe_poste",
            "mois",
            "brut",
            "net",
            "lignes",
            "statut",
            "paye_le",
            "notes",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "net", "created_at", "updated_at"]

    def get_lignes(self, obj):
        return LigneBulletinSerializer(obj.lignes.all(), many=True).data


class LigneBulletinSerializer(serializers.ModelSerializer):
    type_ligne_display = serializers.CharField(
        source="get_type_ligne_display", read_only=True
    )

    class Meta:
        model = LigneBulletin
        fields = [
            "id",
            "bulletin",
            "type_ligne",
            "type_ligne_display",
            "libelle",
            "montant",
            "ordre",
        ]
        read_only_fields = ["id"]


class MissionMooSerializer(serializers.ModelSerializer):
    employe_code = serializers.CharField(source="employe.code", read_only=True)
    employe_nom = serializers.CharField(source="employe.nom_complet", read_only=True)

    class Meta:
        model = MissionMoo
        fields = [
            "id",
            "employe",
            "employe_code",
            "employe_nom",
            "projet_ref",
            "description",
            "date_debut",
            "date_fin",
            "montant_forfaitaire",
            "paye_le",
            "notes",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class CongeSerializer(serializers.ModelSerializer):
    employe_code = serializers.CharField(source="employe.code", read_only=True)
    employe_nom = serializers.CharField(source="employe.nom_complet", read_only=True)
    type_conge_display = serializers.CharField(
        source="get_type_conge_display", read_only=True
    )
    statut_display = serializers.CharField(source="get_statut_display", read_only=True)
    nb_jours = serializers.ReadOnlyField()

    class Meta:
        model = Conge
        fields = [
            "id",
            "employe",
            "employe_code",
            "employe_nom",
            "type_conge",
            "type_conge_display",
            "date_debut",
            "date_fin",
            "nb_jours",
            "motif",
            "statut",
            "statut_display",
            "approuve_par",
            "approuve_le",
            "notes",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "nb_jours", "created_at", "updated_at"]


class CompetenceSerializer(serializers.ModelSerializer):
    categorie_display = serializers.CharField(
        source="get_categorie_display", read_only=True
    )
    nb_employes = serializers.IntegerField(source="acquisitions.count", read_only=True)

    class Meta:
        model = Competence
        fields = [
            "id",
            "code",
            "libelle",
            "categorie",
            "categorie_display",
            "niveau_max",
            "actif",
            "description",
            "nb_employes",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "nb_employes", "created_at", "updated_at"]


class CompetenceEmployeSerializer(serializers.ModelSerializer):
    employe_nom = serializers.CharField(source="employe.nom_complet", read_only=True)
    competence_code = serializers.CharField(source="competence.code", read_only=True)
    competence_nom = serializers.CharField(source="competence.libelle", read_only=True)
    competence_categorie = serializers.CharField(
        source="competence.get_categorie_display", read_only=True
    )
    niveau_max = serializers.IntegerField(
        source="competence.niveau_max", read_only=True
    )

    class Meta:
        model = CompetenceEmploye
        fields = [
            "id",
            "employe",
            "employe_nom",
            "competence",
            "competence_code",
            "competence_nom",
            "competence_categorie",
            "niveau",
            "niveau_max",
            "date_acquisition",
            "notes",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class CertificationSerializer(serializers.ModelSerializer):
    employe_nom = serializers.CharField(source="employe.nom_complet", read_only=True)
    statut = serializers.ReadOnlyField()

    class Meta:
        model = Certification
        fields = [
            "id",
            "employe",
            "employe_nom",
            "libelle",
            "organisme",
            "numero",
            "date_obtention",
            "date_expiration",
            "statut",
            "notes",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "statut", "created_at", "updated_at"]


class HistoriqueContratSerializer(serializers.ModelSerializer):
    employe_nom = serializers.CharField(source="employe.nom_complet", read_only=True)
    type_contrat_display = serializers.CharField(
        source="get_type_contrat_display", read_only=True
    )
    est_en_cours = serializers.ReadOnlyField()

    class Meta:
        model = HistoriqueContrat
        fields = [
            "id",
            "employe",
            "employe_nom",
            "type_contrat",
            "type_contrat_display",
            "poste",
            "date_debut",
            "date_fin",
            "est_en_cours",
            "salaire_mensuel",
            "taux_journalier",
            "motif_fin",
            "notes",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "est_en_cours", "created_at", "updated_at"]


class PaiementSerializer(serializers.ModelSerializer):
    employe_code = serializers.CharField(source="employe.code", read_only=True)
    employe_nom = serializers.CharField(source="employe.nom_complet", read_only=True)
    mode_display = serializers.CharField(source="get_mode_display", read_only=True)
    bulletin_ref = serializers.CharField(
        source="bulletin.mois", read_only=True, default=""
    )

    class Meta:
        model = Paiement
        fields = [
            "id",
            "employe",
            "employe_code",
            "employe_nom",
            "date",
            "montant",
            "mode",
            "mode_display",
            "reference",
            "bulletin",
            "bulletin_ref",
            "notes",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]
