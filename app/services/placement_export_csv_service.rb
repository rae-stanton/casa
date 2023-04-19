require "csv"

class PlacementExportCsvService
  attr_reader :placements

  # it is a bad practice to pass in complex objects to another object like this
  # you are theore
  def initialize(casa_org_id:)
    @casa_org = CasaOrg.find(casa_org_id)
  end

  def perform
    placements = fetch_placements

    CSV.generate(headers: true) do |csv|
      csv << full_data.keys.map(&:to_s).map(&:titleize)
      if placements.present?
        placements.decorate.each do |placements|
          csv << full_data(placements).values
        end
    end
  end

  private

  def full_data(placement = nil)
    {
      casa_org: placement&.id,
      #casa_case_number: placement&.casa_case&.case_number,
      placement_type_id: placement&.placement_type_id,
      placement_started_at: placement&.placement_started_at,
      created_at: placement&.created_at,
      creator_name: placement&.creator&.display_name
    }
  end

  def fetch_placements
    # query for placements here
    @casa_org.placements
  end
end
