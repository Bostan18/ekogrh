from django.contrib import admin

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
    RetenueCategorie,
)


@admin.register(Employe)
class EmployeAdmin(admin.ModelAdmin):
    list_display = [
        "code",
        "nom",
        "prenom",
        "type_contrat",
        "categorie",
        "poste",
        "statut",
    ]
    list_filter = ["type_contrat", "statut", "categorie"]
    search_fields = ["nom", "prenom", "code"]


@admin.register(PresenceJournaliere)
class PresenceAdmin(admin.ModelAdmin):
    list_display = ["employe", "date", "present", "montant_du", "statut", "paye_le"]
    list_filter = ["present", "statut", "date"]
    search_fields = ["employe__nom"]


@admin.register(BulletinPaie)
class BulletinAdmin(admin.ModelAdmin):
    list_display = ["employe", "mois", "brut", "net", "statut"]
    list_filter = ["statut"]


@admin.register(Conge)
class CongeAdmin(admin.ModelAdmin):
    list_display = ["employe", "type_conge", "date_debut", "date_fin", "statut"]
    list_filter = ["type_conge", "statut"]


admin.site.register(LigneBulletin)
admin.site.register(MissionMoo)
admin.site.register(Paiement)
admin.site.register(Competence)
admin.site.register(CompetenceEmploye)
admin.site.register(Certification)
admin.site.register(HistoriqueContrat)


@admin.register(RetenueCategorie)
class RetenueCategorieAdmin(admin.ModelAdmin):
    list_display = [
        "type_contrat",
        "taux_cnps_salarial",
        "taux_is",
        "taux_cnps_patronal_retraite",
        "actif",
    ]
    list_filter = ["actif"]
    list_editable = [
        "taux_cnps_salarial",
        "taux_is",
        "taux_cnps_patronal_retraite",
        "actif",
    ]
