// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/**
 * @title BaseExplorer
 * @notice Free mint NFT for Base ecosystem explorers on Base Sepolia
 * @dev ERC-721 with sequential token IDs and onchain metadata
 */
contract BaseExplorer {
    // --- Errors ---
    error MaxSupplyReached();
    error AlreadyMinted();
    error InvalidTokenId();
    error NotOwner();

    // --- Events ---
    event Minted(address indexed to, uint256 indexed tokenId);
    event BaseURIUpdated(string uri);

    // --- ERC-721 State ---
    string public name = "Base Explorer";
    string public symbol = "BEXP";

    // --- Supply ---
    uint256 public constant MAX_SUPPLY = 500;
    uint256 public totalSupply;

    // --- Per-address mint tracking ---
    mapping(address => bool) public hasMinted;

    // --- Token state ---
    mapping(uint256 => address) private _owners;
    mapping(uint256 => string) private _tokenURIs;
    mapping(address => uint256) private _balances;

    // --- Metadata ---
    string public baseTokenURI = "ipfs://base-explorer/";
    address public owner;

    // --- Modifiers ---
    modifier onlyOwner() {
        if (msg.sender != owner) revert NotOwner();
        _;
    }

    // --- Constructor ---
    constructor() {
        owner = msg.sender;
    }

    // --- Mint ---
    function mint() external returns (uint256) {
        if (totalSupply >= MAX_SUPPLY) revert MaxSupplyReached();
        if (hasMinted[msg.sender]) revert AlreadyMinted();

        totalSupply++;
        uint256 tokenId = totalSupply;

        hasMinted[msg.sender] = true;
        _owners[tokenId] = msg.sender;
        _balances[msg.sender]++;

        emit Minted(msg.sender, tokenId);
        return tokenId;
    }

    // --- Token URI ---
    function tokenURI(uint256 tokenId) public view returns (string memory) {
        if (_owners[tokenId] == address(0)) revert InvalidTokenId();
        return string(abi.encodePacked(baseTokenURI, _toString(tokenId)));
    }

    // --- Owner functions ---
    function setBaseURI(string calldata uri) external onlyOwner {
        baseTokenURI = uri;
        emit BaseURIUpdated(uri);
    }

    // --- ERC-721 helpers ---
    function balanceOf(address _owner) external view returns (uint256) {
        return _balances[_owner];
    }

    function ownerOf(uint256 tokenId) external view returns (address) {
        address tokenOwner = _owners[tokenId];
        if (tokenOwner == address(0)) revert InvalidTokenId();
        return tokenOwner;
    }

    // --- Transfer support (basic) ---
    function transferFrom(address from, address to, uint256 tokenId) external {
        if (_owners[tokenId] != msg.sender && _owners[tokenId] != from) revert NotOwner();
        if (_owners[tokenId] != from) revert InvalidTokenId();
        _owners[tokenId] = to;
        _balances[from]--;
        _balances[to]++;
    }

    // --- Utility ---
    function _toString(uint256 value) internal pure returns (string memory) {
        if (value == 0) return "0";
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) { digits++; temp /= 10; }
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits--;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        return string(buffer);
    }

    // --- Supports Interface (ERC-721) ---
    function supportsInterface(bytes4 interfaceId) external pure returns (bool) {
        return interfaceId == 0x80ac58cd; // ERC-721
    }
}
