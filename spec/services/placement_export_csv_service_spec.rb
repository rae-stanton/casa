require "rails_helper"
require "factory_bot_rails"

RSpec.describe PlacementExportCsvService do
  # Casa_org was added here to override a "name already taken" error in the test
  # due to the casa_org model requiring unique: name. When attempting to use the existing factories as-is,
  # it threw the name already taken error.
  let(:casa_org) { build(:casa_org, name: "Fake Name", display_name: "Fake Display Name") }
  let(:placement_type) { build(:placement_type, casa_org: casa_org) }
  let(:creator) { build(:user) }
  let(:placement) { build(:placement, creator: creator, placement_type: placement_type) }

  it "creates a Placements csv with placements headers" do
    csv_headers = "Casa Org,Casa Case Number,Placement Type,Placement Started At,Created At,Creator Name\n"
    placements = Placement.all
    result = PlacementExportCsvService.new(placements).perform
    expect(result).to start_with(csv_headers)
  end
end
