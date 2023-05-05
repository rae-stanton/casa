import Swal from 'sweetalert2'

// Replaces a number in a string with its value -1
//   @param  {string} str The string containing the number to replace
//   @param  {number} num The number to replace
//   @return {string} The new string with the number decremented
function replaceNumberWithDecrement (str, num) {
  const captureStringWithoutNumPattern = new RegExp(`(^.*)${num}(.*$)`)
  const stringWithoutNum = str.match(captureStringWithoutNumPattern)

  return stringWithoutNum[1] + (num - 1) + stringWithoutNum[2]
}

module.exports = class CourtOrderList {
  // @param {object} The HTMLElement to contain the list items
  constructor (courtOrdersWidget) {
    // The following regex is intended for pathnames such as "/casa_cases/CINA-19-1004/court_dates/new"
    const urlMatch = window.location.pathname.match(/^\/([a-z_]+)s\/(\w+-+\d+)(\/(([a-z_]+)s))?/).filter(match => match !== undefined)
    this.courtOrdersWidget = courtOrdersWidget
    this.resourceName = this.courtOrdersWidget[0].dataset.resource
    // The casaCaseId will be something like "CINA-19-1004"
    this.casaCaseId = urlMatch[2]
  }

  // Adds a row containing a text field to write the court order and a dropdown to specify the order status
  addCourtOrder () {
    const index = this.courtOrdersWidget.children('.court-order-entry').length
    const resourceName = this.resourceName
    const courtOrderRow = $(`\
    <div class="court-order-entry">\
      <textarea
      name="${resourceName}[case_court_orders_attributes][${index}][text]"\
      id="${resourceName}_case_court_orders_attributes_${index}_text"></textarea>
    <select\
    class="implementation-status"\
    name="${resourceName}[case_court_orders_attributes][${index}][implementation_status]"\
    id="${resourceName}_case_court_orders_attributes_${index}_implementation_status">\
        <option value="">Set Implementation Status</option>
        <option value="unimplemented">Not implemented</option>
        <option value="partially_implemented">Partially implemented</option>
        <option value="implemented">Implemented</option>
      </select>
      <input
        type="hidden"
        id="${resourceName}_case_court_orders_attributes_${index}_casa_case_id"
        name="${resourceName}[case_court_orders_attributes][${index}][casa_case_id]"
        value="${this.casaCaseId}">
    </div>`)

    this.courtOrdersWidget.append(courtOrderRow)
    courtOrderRow.children('textarea').trigger('focus')
  }

  // Removes a row of elements representing a single court order
  // and removes the accompanying hidden input containing the order id
  //   @param {object} order              The jQuery object representing the court order div to remove
  //   @param {object} orderHiddenIdInput The jQuery object representing the hidden court order id input
  removeCourtOrder (order, orderHiddenIdInput) {
    // Index relative to the other court orders excluding hidden inputs
    const index = order.index() / 2

    order.remove()
    orderHiddenIdInput.remove()

    // Decrement indicies of all siblings after deleted element
    this.courtOrdersWidget.children(`.court-order-entry:nth-child(n+${2 * index})`).each(function (originalSiblingIndex) {
      const courtOrderSibling = $(this)
      const courtOrderSiblingSelect = courtOrderSibling.children('select')
      const courtOrderSiblingTextArea = courtOrderSibling.children('textarea')

      courtOrderSiblingSelect.attr('id', replaceNumberWithDecrement(courtOrderSiblingSelect.attr('id'), originalSiblingIndex + index + 1))
      courtOrderSiblingSelect.attr('name', replaceNumberWithDecrement(courtOrderSiblingSelect.attr('name'), originalSiblingIndex + index + 1))
      courtOrderSiblingTextArea.attr('id', replaceNumberWithDecrement(courtOrderSiblingTextArea.attr('id'), originalSiblingIndex + index + 1))
      courtOrderSiblingTextArea.attr('name', replaceNumberWithDecrement(courtOrderSiblingTextArea.attr('name'), originalSiblingIndex + index + 1))
    })

    this.courtOrdersWidget.children(`input[type="hidden"]:nth-child(n+${2 * (index + 1)})`).each(function (originalSiblingIndex) {
      const courtOrderSiblingId = $(this)

      courtOrderSiblingId.attr('id', replaceNumberWithDecrement(courtOrderSiblingId.attr('id'), originalSiblingIndex + index + 1))
      courtOrderSiblingId.attr('name', replaceNumberWithDecrement(courtOrderSiblingId.attr('name'), originalSiblingIndex + index + 1))
    })
  }

  removeCourtOrderWithConfirmation (order) {
    const text = 'Are you sure you want to remove this court order? Doing so will ' +
      'delete all records of it unless it was included in a previous court report.'
    Swal.fire({
      icon: 'warning',
      title: 'Delete court order?',
      text,
      showCloseButton: true,
      showCancelButton: true,
      focusConfirm: false,

      confirmButtonColor: '#d33',
      cancelButtonColor: '#39c',

      confirmButtonText: 'Delete',
      cancelButtonText: 'Go back'
    }).then((result) => {
      if (result.isConfirmed) {
        this.removeCourtOrderAction(order)
      }
    })
  }

  removeCourtOrderAction (order) {
    const orderHiddenIdInput = order.next('input[type="hidden"]')

    $.ajax({
      url: `/case_court_orders/${orderHiddenIdInput.val()}`,
      method: 'delete',
      success: () => {
        this.removeCourtOrder(order, orderHiddenIdInput)
        Swal.fire({
          icon: 'success',
          text: 'Court order has been removed.',
          showCloseButton: true
        })
      },
      error: () => {
        Swal.fire({
          icon: 'error',
          text: 'Something went wrong when attempting to delete this court order.',
          showCloseButton: true
        })
      }
    })
  }
}
