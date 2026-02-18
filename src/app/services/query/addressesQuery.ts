export const CREATE_ADDRESS_MUTATION = `
mutation UpdateUser ($id: String!, $userData: mutationUserUpdateInput!) {
  updateUser (id: $id, data: $userData) {
    id
    phone
    addresses {
      alias
      isDefault
      fullAddress
      roadAddress
      jibunAddress
      zonecode
      latitude
      longitude
      buildingName
      addressDetail
      district
      houseNumber
      apartment
      entrance
      city
    }
  }
}
`;
