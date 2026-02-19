const USER_FIELDS = `
  id
  name
  email
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
`;

export const UPDATE_USER_PROFILE_MUTATION = `
mutation UpdateUser ($id: String!, $userData: mutationUserUpdateInput!) {
  updateUser (id: $id, data: $userData) {
    ${USER_FIELDS}
  }
}
`;

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
