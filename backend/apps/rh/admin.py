from django.contrib import admin
from .models import (
    Employe, PresenceJournaliere, BulletinPaie, LigneBulletin,
    Conge, MissionMoo, Paiement, Competence, CompetenceEmploye,
    Certification, HistoriqueContrat,
)


@admin.register(Employe)
class EmployeAdmin(admin.ModelAdmin):
    list_display = ["code", "nom", "prenom", "type_contrat", "poste", "statut"]
    list_filter = ["type_contrat", "statut"]
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
